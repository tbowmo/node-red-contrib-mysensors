import {
    INodeMessage,
    IStrongMysensorsMsg,
    MsgOrigin,
    MysensorsCommand,
} from '../mysensors-msg'
import { IDecoder } from './decoder-interface'
import { MysensorsDecoder } from './mysensors-decoder'

export class MysensorsMqtt extends MysensorsDecoder implements IDecoder {

    public async decode(msg: Readonly<INodeMessage>): Promise<IStrongMysensorsMsg<MysensorsCommand>| undefined> {
        if (msg.topic) {
            const split = msg.topic.toString().split('/')
            if (split.length >= 6) {
                const msgOut: IStrongMysensorsMsg<MysensorsCommand> = {
                    ...msg,
                    topicRoot: split.slice(0, split.length - 5).join('/'),
                    nodeId: parseInt( split[split.length - 5], 10 ),
                    childSensorId: parseInt( split[split.length - 4], 10 ),
                    messageType: parseInt( split[split.length - 3], 10 ),
                    ack: (split[split.length - 2] === '1') ? 1 : 0,
                    subType: parseInt( split[split.length - 1], 10 ),
                    origin: MsgOrigin.mqtt,
                }
                return this.enrich(msgOut)
            }
        }
    }

    public encode(
        msg: Readonly<IStrongMysensorsMsg<MysensorsCommand>>,
    ): IStrongMysensorsMsg<MysensorsCommand> {
        return {
            ...msg,
            topic: (msg.topicRoot ? `${msg.topicRoot}/` : '')
            + `${msg.nodeId}/${msg.childSensorId}/${msg.messageType}/${msg.ack}/${msg.subType}`,
        }
    }
}
