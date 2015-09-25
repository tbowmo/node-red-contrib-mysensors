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
        var node = this;

        if (this.presentation) {
            setTimeout(function() {
                var msg = {};
                msg.payload = node.presentationtext;
                msg.nodeId = node.nodeid;
                msg.childsensorId = node.childid;
                msg.subType = node.presentationtype;
                msg.messageType = 0;
                msg.ack = 0;
                node.send(msg);
            }, 1000);
        }

        this.on('input', function(msg) {
            msg.nodeId = node.nodeid;
            msg.childSensorId = node.childid;
            msg.subType = node.subtype;
            msg.messageType = node.msgtype;
            msg.ack = (node.ack?1:0);
            if (node.msgtype == 3) msg.childSensorId = 255;
            node.send(msg);
        });

    }
    RED.nodes.registerType("mysencap",Encapsulate);
}
