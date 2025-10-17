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
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))

            obj = SensorData.objects.create(
                temperature=data.get("temperature"),
                humidity=data.get("humidity"),
                pressure=data.get("pressure")
            )

            # --- Отправка данных в WebSocket-группу ---
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "graph_group",
                {
                    "type": "new_data",
                    "data": {
                        "temperature": obj.temperature,
                        "humidity": obj.humidity,
                        "pressure": obj.pressure,
                    }
                }
            )

            return JsonResponse({"status": "ok"})

        except Exception as e:
            print("Ошибка при обработке JSON:", e)
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"status": "method not allowed"}, status=405)
