// #include <ESP8266WiFi.h>
// #include <ESP8266WebServer.h>
// #include <Wire.h>
// #include <GyverBME280.h>
// #include <GyverHTU21D.h>

// GyverBME280 bme;
// GyverHTU21D htu;
// ESP8266WebServer server(80);

// // ===== Wi-Fi =====
// const char* ssid = "MERCUSYS_9A2E";
// const char* password = "31324120";

// // ===== HTML главная страница =====
// const char* htmlPage = R"rawliteral(
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="utf-8">
// <title>Weather Station</title>
// <style>
//   body { font-family: Arial; text-align:center; margin-top:40px; background:#f7f9fa; }
//   h1 { color:#0077aa; }
//   .box { display:inline-block; background:white; padding:20px 40px; margin:10px;
//          border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);}
//   .value { font-size:2em; color:#222; }
// </style>
// </head>
// <body>
// <h1>Weather Station</h1>
// <div class="box">
//   <div>🌡 Temperature</div>
//   <div class="value" id="temp">--</div>
// </div>
// <div class="box">
//   <div>💧 Humidity</div>
//   <div class="value" id="hum">--</div>
// </div>
// <div class="box">
//   <div>⏱ Pressure</div>
//   <div class="value" id="pres">--</div>
// </div>

// <script>
// function updateData() {
//   fetch('/data')
//     .then(response => response.json())
//     .then(data => {
//       document.getElementById('temp').innerText = data.temperature.toFixed(2) + " °C";
//       document.getElementById('hum').innerText = data.humidity.toFixed(2) + " %";
//       document.getElementById('pres').innerText = data.pressure.toFixed(2) + " hPa";
//     })
//     .catch(err => console.error(err));
// }

// // обновляем каждые 1.5 секунды
// setInterval(updateData, 1500);
// updateData();
// </script>
// </body>
// </html>
// )rawliteral";

// // ===== Обработка главной страницы =====
// void handleRoot() {
//   server.send(200, "text/html", htmlPage);
// }

// // ===== Обработка данных в JSON =====
// void handleData() {
//   float t = bme.readTemperature();
//   float p = bme.readPressure() / 100.0;
//   float h = 0;

//   if (htu.readTick()) h = htu.getHumidity();

//   String json = "{";
//   json += "\"temperature\":" + String(t,2) + ",";
//   json += "\"humidity\":" + String(h,2) + ",";
//   json += "\"pressure\":" + String(p,2);
//   json += "}";
//   server.send(200, "application/json", json);
// }

// void setup() {
//   Serial.begin(115200);
//   Wire.begin(D2, D1); // общая I2C-шина

//   // Wi-Fi
//   WiFi.begin(ssid, password);
//   Serial.print("Connecting to WiFi");
//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   // Датчики
//   if (!bme.begin(0x76)) Serial.println("BME280 not found!");
//   htu.begin();

//   // Маршруты сервера
//   server.on("/", handleRoot);
//   server.on("/data", handleData);
//   server.begin();
//   Serial.println("HTTP server started");
// }

// void loop() {
//   server.handleClient();
// }
}
//   Serial.println();
//   Serial.print("Connected! IP address: ");
//   Serial.println(WiFi.localIP());

//   // Датчики
//   if (!bme.begin(0x76)) Serial.println("BME280 not found!");
//   htu.begin();

//   // Маршруты сервера
//   server.on("/", handleRoot);
//   server.on("/data", handleData);
//   server.begin();
//   Serial.println("HTTP server started");
// }

// void loop() {
//   server.handleClient();
// }



// #include <Wire.h>

// void setup() {
//   Wire.begin(D2, D1);  // SDA, SCL
//   Serial.begin(115200);
//   Serial.println("\nI2C Scanner");
// }

// void loop() {
//   byte error, address;
//   int nDevices = 0;

//   for (address = 1; address < 127; address++) {
//     Wire.beginTransmission(address);
//     error = Wire.endTransmission();

//     if (error == 0) {
//       Serial.print("I2C device found at 0x");
//       if (address < 16) Serial.print("0");
//       Serial.println(address, HEX);
//       nDevices++;
//     }
//   }

//   if (nDevices == 0) Serial.println("No I2C devices found\n");
//   else Serial.println("Done\n");

//   delay(5000);
// }


#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include <GyverBME280.h>
#include <GyverHTU21D.h>

GyverBME280 bme;
GyverHTU21D htu;

// ===== Wi-Fi =====
const char* ssid = "MERCUSYS_9A2E";
const char* password = "31324120";

// ===== URL Django эндпоинта =====
const char* serverUrl = "http://192.168.1.103:8000/api/data/";

void setup() {
  Serial.begin(115200);
  Wire.begin(D2, D1);

  // Wi-Fi подключение
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // Инициализация датчиков
  if (!bme.begin(0x76)) Serial.println("BME280 not found!");
  htu.begin();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float t = bme.readTemperature();
    float p = bme.readPressure() / 100.0;
    float h = 0;
    if (htu.readTick()) h = htu.getHumidity();

    String json = "{";
    json += "\"temperature\":" + String(t, 2) + ",";
    json += "\"humidity\":" + String(h, 2) + ",";
    json += "\"pressure\":" + String(p, 2);
    json += "}";

    Serial.println("Sending data: " + json);

    WiFiClient client;
    HTTPClient http;
    http.begin(client, serverUrl);              
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(json);
    if (httpCode > 0) {
      Serial.printf("Response code: %d\n", httpCode);
      String payload = http.getString();
      Serial.println(payload);
    } else {
      Serial.printf("Error sending POST: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  } else {
    Serial.println("WiFi disconnected, reconnecting...");
    WiFi.reconnect();
  }

  delay(2000);
}


