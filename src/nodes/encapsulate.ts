import { payloadType, presentation, subtype, mysensorsInternal } from '../lib';
import { Red } from 'node-red';

function registerEncapsulate(RED: Red) {
    console.log(RED);
    function Encapsulate(config: any) {
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
                let msg: MySensors.IMessage;
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

        this.on('input', function(msg: MySensors.IMessage) {
            msg.nodeId = node.nodeid;
            msg.childSensorId = node.childid;
            msg.subType = node.subtype;
            msg.messageType = node.msgtype;
            msg.ack = (node.ack?1:0);
            if (node.msgtype == 3) {
                msg.childSensorId = 255;
                msg.subType = node.internal;
            }
            node.send(msg);
        });

    }
    RED.nodes.registerType("mysencap",Encapsulate);
    
    RED.httpAdmin.get("/mysensordefs/:id", RED.auth.needsPermission(''), function(req: any , res: any) {
        var type = req.params.id;
        let retVal: string = "";
        switch (type) {
            case "subtype": 
                retVal = JSON.stringify({data: subtype});
                break;
            case "presentation":
                retVal = JSON.stringify({data: presentation});
                break;
            case "internal":
                retVal = JSON.stringify({data: mysensorsInternal});
                break;
        }
        res.json(retVal);
    });
}

export = registerEncapsulate;