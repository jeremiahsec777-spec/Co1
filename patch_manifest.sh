#!/bin/bash
FILE="android/app/src/main/AndroidManifest.xml"

# We use sed to add the permissions right below the existing INTERNET permission
sed -i '/<uses-permission android:name="android.permission.INTERNET" \/>/a \
    <!-- Audio Permissions for Recording -->\
    <uses-permission android:name="android.permission.RECORD_AUDIO" />\
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />\
\
    <!-- Storage/Image Permissions for Android 13+ and older -->\
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />\
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />' "$FILE"
