import { Red } from 'node-red';
import { MysensorsMqtt } from '../lib/decoder/mysensors-mqtt';
import { MysensorsSerial } from '../lib/decoder/mysensors-serial';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { NullCheck } from '../lib/nullcheck';
import { IDbConfigNode, IDecodeEncodeConf, IDecodeProperties } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('mysdecode', function(this: IDecodeEncodeConf, props: IDecodeProperties) {
        const config = props as IDecodeProperties;
        if (NullCheck.isDefinedNonNullAndNotEmpty(props.database)) {
            this.database = RED.nodes.getNode(props.database) as IDbConfigNode;
        }
        this.enrich = props.enrich;
        if (config.mqtt) {
            if (this.enrich && NullCheck.isDefinedOrNonNull(this.database)) {
                this.decoder = new MysensorsMqtt(props.enrich, this.database.database);
            } else {
                this.decoder = new MysensorsMqtt();
            }
        } else {
            if (this.enrich && NullCheck.isDefinedOrNonNull(this.database)) {
                this.decoder = new MysensorsSerial(props.enrich, this.database.database);
            } else {
                this.decoder = new MysensorsSerial();
            }
        }
        RED.nodes.createNode(this, config);
        this.on('input', async (msg: IMysensorsMsg) => {
            this.send(await this.decoder.decode(msg));
        });
    });
};
