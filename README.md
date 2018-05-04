# node-red-contrib-mysensors

A node-RED [mysensors](http://www.mysensors.org) protocol decoder / encoder / wrapper package, including basic controller functionality
Contains a node to decode / encode mysensors serial protocol to / from node-red messages, and a node for adding mysensors specific data like sensor type, nodeid etc. which can then be sent to mysensors network

## Install

Please note, that you probably need to have node 6 and above for version 2.1 and above (I got reports of problems with node v4).

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
```

see [mysensors API v2.x](http://www.mysensors.org/download/serial_api_20) for more info on the different parts

The following nodes will be able to use these properties to interact with the messages from the mysensors network

## Node-RED mysencode

This encodes a message into either mysensors serial, or a mysensors mqtt
topic. If using MQTT, then set topicRoot on the message, before sending it
into this node, in order to set your own root topic

## Node-RED mysencap

This will add the message properties mention under mysdecenc to the message object of an existing Node-RED message. By sending the output through mysdecenc, you can create a message that can be sent to the sensor network.

## Node-RED mysdebug

This will decode the mysensors serial protocol payload, and enrich it with descriptions of sensor types etc. Meant as a debugging tool. Data will be sent out of the node, and can be used in a debug node, or dumped to disk, for file logging

## Node-RED myscontroller

This node can handle ID assignment to nodes on your network. Will respond with a new ID everytime it sees a request for an ID from a node.
You need to define a database location, which should be a path to a writable location/file in your filesystem. The node will create the file pointed to, and create the needed tables using sqlite3 format.

