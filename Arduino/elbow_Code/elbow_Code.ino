#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// this information was deleted for better anonymity
const char* ssid     = "name_of_WiFi";
const char* password = "Password_of_WiFi";
const char* server = "xxx.xx.xx.x"; // IP address of server
const int port = 80; // port of server

void setup()
{
  pinMode(A0, INPUT);
  pinMode(A1, INPUT);
  pinMode(A2, INPUT);

  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.print("Connected to WiFi:");
  Serial.println(WiFi.localIP());
}
void loop()
{
    if ((WiFi.status() == WL_CONNECTED))
    {
      HTTPClient http;
      int val0 = analogReadMilliVolts(A1);
      int val1 = analogReadMilliVolts(A2);
      int val2 = analogReadMilliVolts(A3);

      DynamicJsonDocument json(100);
      json["patch"] = "elbowL";
      json["tempHumi"] = val2;
      json["backPressure"] = val0;
      json["sidePressure"] = val1;

      String jsonData;
      serializeJson(json, jsonData);

      String url = "http://" + String(server) + "/sendData?data=" + jsonData;
      Serial.println(url);

      http.begin(url);
      int httpCode = http.GET();
      if (httpCode > 0)
      {
        String payload = http.getString();
        Serial.println(httpCode);
        Serial.println(payload);
      }
      else
      {
        Serial.println("Error on HTTP request");
      }
      http.end();
    }
    
  // sample every 2s
  delay(2000);
}
