#include <Arduino.h>
#include <Wire.h>
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include "addons/TokenHelper.h" //Provide the token generation process info.
#include "addons/RTDBHelper.h"  //Provide the RTDB payload printing info and other helper functions.

// Insert your network credentials
// #define WIFI_SSID "OPPO Reno5"
// #define WIFI_PASSWORD "lmaolmao"
#define WIFI_SSID "FPT phong 12"
#define WIFI_PASSWORD "matkhaula1"
// Insert Firebase project API Key
#define API_KEY "AIzaSyBZUvbeKXJlo_5RJqKJEVk4b0GqgnE3FCY"
// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "https://doantkll-73b19-default-rtdb.firebaseio.com/" // Insert RTDB URLefine the RTDB URL */
// Define user authentication
#define USER_EMAIL "ttdat170703@gmail.com"// Define user authentication
#define USER_PASSWORD "admin@"

#define DEVICE_ID "HCMUT1"
#define BEAT_PATH "/HCMUT1/beat"
#define SPO2_PATH "/HCMUT1/SpO2"

//Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false; //since we are doing an anonymous sign in 

String uid;
String databasePath;

float beat_send = 0;
float spo2_send = 0;

void setup() {
  // Open serial communications and wait for port to open:
  Serial.begin(115200);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
  
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the user sign in credentials */
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h

  // Comment or pass false value when WiFi reconnection will control by your code or third party library e.g. WiFiManager
  Firebase.reconnectNetwork(true);

  Firebase.begin( & config, & auth);

  Firebase.setDoubleDigits(5);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
}

void loop() {
  if (Serial.available()) {
    String data = Serial.readStringUntil('\n'); // Read entire line

    // Extract two float values from the received string
    beat_send = getValue(data, ' ', 0);
    spo2_send = getValue(data, ' ', 1);

    // Print the extracted values
    Serial.print("Beat: ");
    Serial.println(beat_send);
    Firebase.setFloat(fbdo, BEAT_PATH, beat_send);
    Serial.print("SpO2: ");
    Serial.println(spo2_send);
    Firebase.setFloat(fbdo, SPO2_PATH, spo2_send);
  }
}

float getValue(String data, char separator, int index) {
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;

  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i + 1 : i;
    }
  }

  return found > index ? data.substring(strIndex[0], strIndex[1]).toFloat() : 0.0;
}