import { NodeDef, NodeAPI } from 'node-red'

import { AutoDecode } from '../lib/decoder/auto-decode'
import { MysensorsDebugDecode } from '../lib/mysensors-debug'
import { IMysensorsMsg } from '../lib/mysensors-msg'
import {
    mysensor_command,
    mysensor_data,
    mysensor_internal,
    mysensor_sensor,
    mysensor_stream,
} from '../lib/mysensors-types'
import { IDebugConfig } from './common'

export = (RED: NodeAPI) => {
    RED.nodes.registerType(
        'mysdebug',
        function (this: IDebugConfig, config: NodeDef) {
            RED.nodes.createNode(this, config)
            this.mysDbg = new MysensorsDebugDecode()

            this.on('input', async (incommingMsg: IMysensorsMsg, send, done) => {

                const msg = await AutoDecode(incommingMsg)

                if (!msg) {
                    done()
                    return
                }

                let msgHeader = ''
                let msgSubType: string | undefined
                switch (msg.messageType) {
                case mysensor_command.C_PRESENTATION:
                    msgHeader = 'PRESENTATION'
                    msgSubType = mysensor_sensor[msg.subType]
                    break
                case mysensor_command.C_SET:
                    msgHeader = 'SET'
                    msgSubType = mysensor_data[msg.subType]
                    break
                case mysensor_command.C_REQ:
                    msgHeader = 'REQ'
                    msgSubType = mysensor_data[msg.subType]
                    break
                case mysensor_command.C_INTERNAL:
                    if (msg.subType === 9) { // Debug, we try to decode this
                        send({payload: this.mysDbg.decode(msg.payload as string)})
                    } else {
                        msgHeader = 'INTERNAL'
                        msgSubType = mysensor_internal[msg.subType]
                    }
                    break
                case mysensor_command.C_STREAM:
                    msgHeader = 'STREAM'
                    msgSubType = mysensor_stream[msg.subType]
                    break
                default:
                    send({payload: `unsupported msgType ${(msg as {messageType: number}).messageType}`})
                }

                if (msgSubType) {
                    send({
                        // eslint-disable-next-line max-len
                        payload: `${msgHeader} nodeId:${msg.nodeId} childId:${msg.childSensorId} subType:${msg.subType} payload:${msg.payload}`,
                    })
                }
                done()
            })
        },
    )
}
