import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'package:namer_app/environment-variables.dart';
import 'package:path/path.dart';

import '../general-classes/message.dart';

Future<http.Response?> getRequest(String route) async {
  try {
    final response = await http.get(Uri.parse('${getServerUrlApi()}/$route'));

    if (response.statusCode == 200) {
      return response;
    } else {
      throw Exception('Failed GET Request for $route');
    }
  } catch (e) {
    var logger = Logger();
    logger.e(e);
  }

  return null;
}

Future<http.Response> postRequest(String route, Message message) async {
  final Uri url = Uri.parse('${getServerUrlApi()}/$route');
  final response = await http.post(
    url,
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(message.toJson()),
  );

  return response;
}

Future<http.Response> postBody(String route, String body) async {
  final Uri url = Uri.parse('${getServerUrlApi()}/$route');

  final response = await http.post(
    url,
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: body,
  );

  return response;
}

Future<http.Response> postDynamic(
    String route, Map<String, dynamic> body) async {
  final Uri url = Uri.parse('${getServerUrlApi()}/$route');

  final response = await http.post(
    url,
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(body),
  );

  return response;
}

Future<http.Response> postBodyMultiPart(
    String route, Map<String, dynamic> body, File file) async {
  final Uri url = Uri.parse('${getServerUrlApi()}/$route');

  var request = http.MultipartRequest('POST', url);
  body.forEach((key, value) => request.fields[key] = value.toString());

  var fileStream = http.ByteStream(file.openRead());
  var length = await file.length();

  var multipartFile = http.MultipartFile(
    'avatarPicture', // This should match with the field name expected by the server
    fileStream,
    length,
    filename: basename(
        file.path), // You need to import path package to use basename function
  );
  request.files.add(multipartFile);

  try {
    var streamedResponse =
        await request.send().timeout(const Duration(seconds: 30));
    return await http.Response.fromStream(streamedResponse);
  } catch (e) {
    // Rethrow the exception.
    // You could also choose to return an http.Response with an error code here.
    throw Exception('Error during file upload: $e');
  }
}
