# /graph/realtime_graph/graph/consumers.py
# import json
# from random import randint
# from asyncio import sleep

# from channels.generic.websocket import AsyncWebsocketConsumer


# def get_day():
#     days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
#     index = 0
#     while True:
#         yield days[index]

#         index += 1
        
#         if index >= len(days):
#             index = 0


# class GraphConsumer(AsyncWebsocketConsumer):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)

#         self.days_gen = get_day()

#     async def connect(self):
#         await self.accept()
        
#         for i in range(1000):   
#             num = randint(1, 100)
#             day = next(self.days_gen)
#             await self.send(json.dumps({
#                 'value': num, 'day': day
#             }))
#             await sleep(1)


import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GraphConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("graph_group", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("graph_group", self.channel_name)

    # Получаем событие из views.py
    async def new_data(self, event):
        data = event["data"]
        await self.send(json.dumps(data))
