import { expect } from 'chai'
import 'mocha'
import {
    IMysensorsMsg,
    INodeMessage,
    IStrongMysensorsMsg,
} from '../mysensors-msg'
import { mysensor_command } from '../mysensors-types'
import { MysensorsMqtt } from './mysensors-mqtt'

describe('MQTT decode / encode', () => {
    it('Should create correct decoded output when mqtt topic is received', async () => {
        const msg: INodeMessage = {
            _msgid: '',
            payload: '6',
            topic: 'mys-in/1/2/3/0/5',
        }
        const expected: IMysensorsMsg = {
            _msgid: '',
            ack: 0,
            childSensorId: 2,
            messageType: 3,
            nodeId: 1,
            payload: '6',
            subType: 5,
            topicRoot: 'mys-in',

        }
        const out = await new MysensorsMqtt().decode(msg)
        expect(out).to.include(expected)
    })

    it('if not mysensors formatted input return undefined', async () => {
        const msg: INodeMessage = {
            _msgid: '',
            payload: '200',
        }
        const out = await new MysensorsMqtt().decode(msg)
        expect(out).to.equal(undefined)
    })

    it('Encode to mysensors mqtt message', () => {
        const msg: IStrongMysensorsMsg<mysensor_command.C_PRESENTATION> = {
            _msgid: '',
            ack: 0,
            childSensorId: 2,
            messageType: mysensor_command.C_PRESENTATION,
            nodeId: 1,
            payload: '100',
            subType: 4,
            topicRoot: 'mys-out',
        }
        const out = new MysensorsMqtt().encode(msg)
        expect(out).to.include({topic: 'mys-out/1/2/0/0/4', payload: '100'})
    })
})
