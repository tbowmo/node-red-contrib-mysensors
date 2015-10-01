module.exports = function(RED) {
    function Encapsulate(config) {
        RED.nodes.createNode(this,config);
        this.nodeid = config.nodeid;
        this.childid = config.childid;
        this.subtype = config.subtype;
        this.msgtype = config.msgtype;
        this.ack = config.ack;
        this.presentation = config.presentation;
        this.presentationtext = config.presentationtext;
        this.presentationtype = config.presentationtype;
        this.fullpresentation = config.fullpresentation;
        this.internal = config.internal;
        this.firmwarename = config.firmwarename;
        this.firmwareversion = config.firmwareversion;
        var node = this;
        
        if (node.presentation) {
            setTimeout(function() {
                var msg = {};
                msg.nodeId = node.nodeid;
                msg.ack = 0;
                if (node.fullpresentation) {
                    msg.messageType = 3;
                    msg.childSensorId = 255; // Internal messages always send as childi 255
                    msg.subType = 11; // Sketchname
                    msg.payload = node.firmwarename;                
                    node.send(msg);

                    msg.subType = 12; // Sketchname
                    msg.payload = node.firmwareversion;                
                    node.send(msg);
                }
                msg.messageType = 0;
                msg.childSensorId = node.childid;
                msg.subType = node.presentationtype;
                msg.payload = node.presentationtext;
                node.send(msg);
            }, 5000);
        }

        this.on('input', function(msg) {
            msg.nodeId = node.nodeid;
            msg.childSensorId = node.childid;
            msg.subType = node.subtype;
            msg.messageType = node.msgtype;
            msg.ack = (node.ack?1:0);
            if (node.msgtype == 3) {
                msg.childSensorId = 255;
                msgsubType = node.internal;
            }
            node.send(msg);
        });

    }
    RED.nodes.registerType("mysencap",Encapsulate);
}
