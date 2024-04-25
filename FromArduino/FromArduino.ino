#include <Arduino.h>
#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <SoftwareSerial.h> //instead of parenthesis () put angle bracket as YouTube description does not allow angle bracket 

SoftwareSerial espSerial(5, 6);
String str;

#define REPORTING_PERIOD_MS   1000

// PulseOximeter is the higher level interface to the sensor
// it offers:
//  * beat detection reporting
//  * heart rate calculation
//  * SpO2 (oxidation level) calculation
PulseOximeter pox;

uint32_t tsLastReport = 0;

float beat_send = 0;
float spo2_send = 0;

// Callback (registered below) fired when a pulse is detected
void onBeatDetected(){  
  Serial.println("Beat!");
}

void setup(){
  Serial.begin(115200);
  espSerial.begin(115200);

  Serial.print("Initializing pulse oximeter..");
  // Initialize the PulseOximeter instance
  // Failures are generally due to an improper I2C wiring, missing power supply
  // or wrong target chip
  if (!pox.begin()) {
      Serial.println("FAILED");
      for(;;);
  } else {
      Serial.println("SUCCESS");
  }
  // The default current for the IR LED is 50mA and it could be changed
  //   by uncommenting the following line. Check MAX30100_Registers.h for all the
  //   available options.
  // pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
  // Register a callback for the beat detection
  pox.setOnBeatDetectedCallback(onBeatDetected);
}
void loop()
{
  // Make sure to call update as fast as possible
  pox.update();

  if (millis() - tsLastReport > REPORTING_PERIOD_MS){
    beat_send = pox.getHeartRate();
    spo2_send = pox.getSpO2();
    Serial.print("Heart rate:");
    Serial.print(pox.getHeartRate());
    Serial.print("bpm / SpO2:");
    Serial.print(pox.getSpO2());
    Serial.println("%");
    str =String(beat_send)+String(" ")+String(spo2_send);
    espSerial.println(str);
    tsLastReport = millis();
  }
}