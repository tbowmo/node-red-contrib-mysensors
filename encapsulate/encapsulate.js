module.exports = function(RED) {
    function Encapsulate(config) {
        RED.nodes.createNode(this,config);
        this.nodeid = config.nodeid;
        this.childid = config.childid;
        this.subtype = config.subtype;
        var node = this;
        this.on('input', function(msg) {
            msg.nodeId = node.nodeid;
            msg.childSensorId = node.childid;
            msg.subType = node.subtype;
            msg.messageType = 1;
            msg.ack = 0;
            node.send(msg);
        });

    }
    RED.nodes.registerType("mysencap",Encapsulate);
}
