# /graph/realtime_graph/graph/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

# (Браузер WebSocket) ── connect() ──► GraphConsumer
#          │                          │
#          │ self.channel_name = "graph!dfgh823..."
#          │                          │
#          └────── group_add("graph_group", "graph!dfgh823...") ───► Redis (channel_layer)
#             “Добавь это соединение в группу с именем graph_group”


class GraphConsumer(AsyncWebsocketConsumer):
    async def connect(self):                # Когда юзер открывает страницу /, JS подключается по WS → Django вызывает это
        await self.channel_layer.group_add("graph_group", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("graph_group", self.channel_name)

    # Получаем событие из views.py
    async def new_data(self, event):
        data = event["data"]
        await self.send(json.dumps(data))



# Wemos → HTTP /api/data/ → Django view (сохраняет в БД)
#         ↓
#         ↓ через channel_layer.group_send()
#         ↓
# GraphConsumer.new_data() → WebSocket → браузер → обновление графика
