# /graph/realtime_graph/graph/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import SensorData


def index(request):
    return render(request, 'index.html', context={'text': 'Real Time Graph'})


@csrf_exempt
def sensor_data(request):
    
    # [ Wemos ] 
    #    ↓ POST /api/data/
    # [ Django view (sensor_data) ]
    #    ↓ Сохраняет данные в БД
    #    ↓ channel_layer.group_send("graph_group", {...})
    # [ GraphConsumer (WebSocket) ]
    #    ↓ send() через WebSocket
    # [ JS в браузере ]
    #    ↓ socket.onmessage()
    #    ↓ обновляет графики Chart.js

    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))

            obj = SensorData.objects.create(
                temperature=data.get("temperature"),
                humidity=data.get("humidity"),
                pressure=data.get("pressure")
            )

            # --- Отправка данных в WebSocket-группу ---

            channel_layer = get_channel_layer()         # Канал связи между Django (HTTP) и Channels (WebSocket) через Redis
            async_to_sync(channel_layer.group_send)(    # Отправляет сообщение всем WebSocket-подписчикам группы, 
                "graph_group",                          # Позволяет синхронной view вызвать асинхронную функцию
                {
                    "type": "new_data",
                    "data": {
                        "temperature": obj.temperature,
                        "humidity": obj.humidity,
                        "pressure": obj.pressure,
                    }
                }
            )

            return JsonResponse({"status": "ok"})       # Возвращает ответ Wemos о успешном приёме

# 172.30.172.243
           

        except Exception as e:
            print("Ошибка при обработке JSON:", e)
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"status": "method not allowed"}, status=405)


def all_data(request):
    qs = SensorData.objects.all()
    data = []
    for obj in qs:
        data.append({
            'id': obj.id,
            'temperature': obj.temperature,
            'humidity': obj.humidity,
            'pressure': obj.pressure,
            'timestamp': obj.timestamp.isoformat()  
        })

    return render(request, 'all.html', context={'data': data})
