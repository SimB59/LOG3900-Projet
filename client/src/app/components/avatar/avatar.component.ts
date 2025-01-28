/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { OnInit, Component, Input } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AvatarSelectionComponent } from '@app/components/avatar-selection/avatar-selection.component';
import { DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { ThemeService } from '@app/services/theme/theme.service';
import { AlertService } from '@app/services/alert/alert.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
    @Input() size: string = '125px';
    @Input() allowModification: boolean = false;
    @Input() inputAvatar: string;
    protected image: string;
    protected file?: File;
    private defaultAvatar: File;
    private defaultAvatarPath: string = 'assets/images/avatar-placeholder.png';
    private defaultAvatarFileName: string = 'avatar-placeholder.png';

    // eslint-disable-next-line max-params
    constructor(
        protected dialog: MatDialog,
        private accountService: AccountService,
        protected translateService: TranslateService,
        protected themeService: ThemeService,
        protected alertService: AlertService,
    ) {}

    get avatarFile(): File {
        if (this.file) {
            return this.file;
        } else {
            return this.defaultAvatar;
        }
    }

    set avatarFile(file: File) {
        this.file = file;
    }

    set avatarImage(image: string) {
        this.image = image;
    }

    async ngOnInit() {
        if (this.inputAvatar) {
            this.file = await this.accountService.fetchAvatarImage(this.inputAvatar);
            this.image = URL.createObjectURL(this.file);
        } else if (this.accountService.avatar) {
            this.file = this.accountService.avatar;
            this.image = URL.createObjectURL(this.file);
        } else {
            this.image = '';
            this.setDefaultAvatarFile();
        }
    }

    fileIsSet(): boolean {
        return this.file !== undefined;
    }

    saveNewAvatar(newFile: File) {
        if (this.isExtensionSupported(newFile)) {
            this.file = newFile;
            this.image = URL.createObjectURL(this.file);
            this.accountService.saveNewAvatar(this.file);
        } else {
            this.alertService.generatePopUp('UNSUPPORTED_MEDIA_TYPE error message', true);
        }
    }

    protected showSelection() {
        const dialogRef = this.dialog.open(AvatarSelectionComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.image = result;
                fetch(result)
                    .then(async (response) => response.blob())
                    .then((blob) => {
                        this.file = new File([blob], result, { type: blob.type });
                        this.resetInput();
                    })
                    .catch(() => this.clearFile());
            }
        });
    }

    protected isExtensionSupported(file: File): boolean {
        return file.type.includes('png') || file.type.includes('jpeg') || file.type.includes('jpg');
    }

    protected onFileChange(fileChangeEvent: Event) {
        const target = fileChangeEvent.target as HTMLInputElement;
        if (target && target.files && target.files.length) {
            const file = target.files[0];
            if (this.isExtensionSupported(file)) {
                this.file = file;
                this.setImage(target);
                this.resetInput();
            } else {
                this.alertService.generatePopUp('UNSUPPORTED_MEDIA_TYPE error message', true);
            }
        }
    }

    protected clearFile(): void {
        this.file = undefined;
        this.image = '';
    }

    private async setDefaultAvatarFile() {
        const response = await fetch(this.defaultAvatarPath);
        const data = await response.blob();
        this.defaultAvatar = new File([data], this.defaultAvatarFileName, { type: data.type });
    }

    private setImage(target: HTMLInputElement) {
        const files = target.files as FileList;
        if (files.length > 0) {
            this.image = URL.createObjectURL(files[0]);
        }
    }

    private resetInput() {
        const input = document.getElementById('avatar-input-file') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    }
}
