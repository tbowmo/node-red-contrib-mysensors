import { NodeProperties, Red } from 'node-red';
import { AutoDecode } from '../lib/decoder/auto-decode';
import { MysensorsDebugDecode } from '../lib/mysensors-debug';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import {
    mysensor_command,
    mysensor_data,
    mysensor_internal,
    mysensor_sensor,
    mysensor_stream,
    } from '../lib/mysensors-types';
import { NullCheck } from '../lib/nullcheck';
import { IDebugConfig } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('mysdebug', function(this: IDebugConfig, config: NodeProperties) {
        RED.nodes.createNode(this, config);
        this.mysDbg = new MysensorsDebugDecode();

        this.on('input', (msg: IMysensorsMsg) => {
            msg = AutoDecode(msg);
            if (NullCheck.isDefinedOrNonNull(msg.nodeId)) {
                let msgHeader = '';
                let msgSubType: string | null = null;
                if (NullCheck.isDefinedOrNonNull(msg.subType)) {
                    switch (msg.messageType) {
                        case mysensor_command.C_PRESENTATION:
                            msgHeader = 'PRESENTATION';
                            msgSubType = mysensor_sensor[msg.subType];
                            break;
                        case mysensor_command.C_SET:
                            msgHeader = 'SET';
                            msgSubType = mysensor_data[msg.subType];
                            break;
                        case mysensor_command.C_REQ:
                            msgHeader = 'REQ';
                            msgSubType = mysensor_data[msg.subType];
                            break;
                        case mysensor_command.C_INTERNAL:
                            if (msg.subType === 9) { msg.payload = this.mysDbg.decode(msg.payload); } else {
                                msgHeader = 'INTERNAL';
                                msgSubType = mysensor_internal[msg.subType];
                            }
                            break;
                        case mysensor_command.C_STREAM:
                            msgHeader = 'STREAM';
                            msgSubType = mysensor_stream[msg.subType];
                            break;
                        default:
                            msg.payload = 'unsupported msgType ' + msg.messageType;
                            break;
                    }
                }
                if (msgSubType != null) {
                    msg.payload = msgHeader +
                        ';nodeId:' + msg.nodeId +
                        ';childId:' + msg.childSensorId +
                        ';SubType:' + msgSubType +
                        ';ACK:' + msg.ack +
                        ';Payload:' + msg.payload;
                }

            }
            this.send(msg);
        });
    });
};
