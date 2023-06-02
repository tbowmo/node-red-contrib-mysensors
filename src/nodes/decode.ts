import { NodeAPI } from 'node-red'

import { MysensorsMqtt } from '../lib/decoder/mysensors-mqtt'
import { MysensorsSerial } from '../lib/decoder/mysensors-serial'
import { IMysensorsMsg, INodeMessage } from '../lib/mysensors-msg'
import {
    IDbConfigNode,
    IDecodeEncodeConf,
    IDecodeProperties,
} from './common'

export = (RED: NodeAPI) => {
    RED.nodes.registerType(
        'mysdecode',
        function (this: IDecodeEncodeConf, props: IDecodeProperties) {
            const config = props as IDecodeProperties
            if (props.database) {
                this.database = RED.nodes.getNode(
                    props.database,
                ) as IDbConfigNode
            }

            this.enrich = props.enrich

            if (config.mqtt) {
                this.decoder = new MysensorsMqtt(
                    props.enrich,
                    this.database?.database,
                )
            } else {
                this.decoder = new MysensorsSerial(
                    props.enrich,
                    this.database?.database,
                )
            }

            RED.nodes.createNode(this, config)

            this.on('input', async (msg: IMysensorsMsg, send, done) => {
                const message = await this.decoder.decode(msg as INodeMessage)
                if (message) {
                    send(message)
                }
                done()
            })
        },
    )
}
