# node-red-contrib-mysensors

A node-RED [mysensors](http://www.mysensors.org) protocol decoder / encoder / wrapper package, including basic controller functionality
Contains a node to decode / encode mysensors serial protocol to / from node-red messages, and a node for adding mysensors specific data like sensor type, nodeid etc. which can then be sent to mysensors network

## Install

Within your local installation of Node-RED run:

`npm install node-red-contrib-mysensors`

Once installed, restart your node-red server, and you will have a set of new nodes available in your palette under mysensors:

## Node-RED mysdecode

This decodes the mysensors serial protocol packages or a MQTT topic from a mysensors MQTT gateway, and enriches the Node-RED msg object with the following extra data:

```
msg.payload // Payload data from sensor network
msg.nodeId // node of the origin
msg.childSensorId
msg.messageType
msg.ack
msg.subType
msg.messageTypeStr
msg.subTypeStr
```
The last two parameters are text representations for message type and sub type. No other mysensros node is actively using these values.

see [mysensors API v2.x](http://www.mysensors.org/download/serial_api_20) for more info on the different parts

The following nodes will be able to use these properties to interact with the messages from the mysensors network

## Node-RED mysencode

This encodes a message into either mysensors serial, or a mysensors mqtt
topic.

If using MQTT, then set topicRoot on the message, before sending it
into this node, in order to set your own root topic, or set it in the node to set the topicRoot like

<code>topicRoot</code>/nodeId/childSensorId/ack/subType

## Node-RED mysencap

This will add the message properties mentioned under mysdecenc to the message object of an existing Node-RED message. By sending the output through mysencode, you can create a message that can be sent to your sensor network, or sent to another controller that understands MySensors serial protocol or MQTT topic format.

If you want to send it to another controller as a serial port format, use socat for creating a dummy serial port (on linux):

```
socat PTY,link=/dev/ttyS80,mode=666,group=dialout,raw PTY,link=/dev/ttyUSB20,mode=666,group=dialout,raw &
```
Now use <code>/dev/ttyS80</code> in a serial port node in node-red, and use <code>/dev/ttyUSB20</code> in your chosen controller.

## Node-RED mysdebug

This will decode the mysensors serial protocol payload, and enrich it with descriptions of sensor types etc. Meant as a debugging tool. Data will be sent out of the node, and can be used in a debug node, or dumped to disk, for file logging

## Node-RED myscontroller

This node can handle ID assignment to nodes on your network. Will respond with a new ID everytime it sees a request for an ID from a node.

The node uses node-red context for storage, which is normally in memory only, and is reset on every startup of your node-red instance. You can configure a filesystem context as well in your node-red settings.js file:

```js
    contextStorage: {
        default: "memoryOnly",
        memoryOnly: {
            module: "memory",
        },
        file: { module: 'localfilesystem' }
    }
```

In this example node-red defaults to memory (keeping things as is), and in addition it creates a secondary localfile storage (called `file`) which you can then set the myscontroller node to use for persistent data storage. Checkout [node-red documentation on context](https://nodered.org/docs/user-guide/context)

The data is kept as a object on a single key entry in the context

The controller keeps track of when it hears the nodes, sketch name / version reported during presentation etc. and will be shown when you look at the configuration page of the node.

