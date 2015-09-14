# node-red-contrib-mysensor

A node-RED mysensors protocol decoder / encoder / wrapper package. 
Contains a node to decode / encode mysensors serial protocol to / from node-red messages, and a node for adding mysensors specific data like sensor type, nodeid etc. which can then be sent to mysensors network

# Install

Within your local installation of Node-RED run:

`npm install node-red-contrib-mysensors`

Once installed, you will have two new nodes available : mysdecenc, and mysencap.

# Node-RED mysdecenc

This decodes the mysensors serial protocol packages, and enriches the Node-RED msg object with the following extra data:

```
msg.payload // Payload data from sensor network
msg.nodeId // node of the origin
msg.childSensorId
msg.messageType
msg.ack
msg.subType
```

... the following nodes will be able to use these properties to interact with the messages from the mysensors network. ...

If you feed the mysdecenc node with a msg object, that contains the above properties, it will output a message conforming to the mysensors serial API protocol, as described at http://www.mysensors.org/download/serial_api_15

# Node-RED mysencap

This will add the message properties mention under mysdecenc, to the message object of an existing Node-RED message. By sending the output through mysdecenc, you can create a message that can be sent to the sensor network.

