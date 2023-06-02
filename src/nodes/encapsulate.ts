import { NodeAPI } from 'node-red'

import { IMysensorsMsg } from '../lib/mysensors-msg'
import {
    mysensor_data,
    mysensor_internal,
    mysensor_sensor,
} from '../lib/mysensors-types'
import { IEncapsulateConfig, IEncapsulateProperties } from './common'

export = (RED: NodeAPI) => {
    RED.nodes.registerType(
        'mysencap',
        function (this: IEncapsulateConfig, props: IEncapsulateProperties) {
            RED.nodes.createNode(this, props)
            this.sensor = getSensor(props)
            this.presentation = props.presentation || false
            this.presentationtext = props.presentationtext || ''
            this.presentationtype = props.presentationtype || 0
            this.fullpresentation = props.fullpresentation || false
            this.internal = props.internal || 0
            this.firmwarename = props.firmwarename || ''
            this.firmwareversion = props.firmwareversion || ''

            if (this.presentation) {
                setTimeout(() => {
                    const msg = getSensor(props)
                    msg.ack = 0
                    if (this.fullpresentation) {
                        msg.messageType = 3
                        msg.childSensorId = 255 // Internal messages always send as childi 255
                        msg.subType = 11 // Sketchname
                        msg.payload = this.firmwarename
                        this.send(msg)

                        msg.subType = 12 // Sketchname
                        msg.payload = this.firmwareversion
                        this.send(msg)
                    }
                    msg.messageType = 0
                    msg.subType = this.presentationtype
                    msg.payload = this.presentationtext
                    this.send(msg)
                }, 5000)
            }

            this.on('input', (msg: IMysensorsMsg, send, done) => {
                const msgOut = this.sensor
                msgOut.payload = msg.payload
                if (this.sensor.messageType === 3) {
                    msgOut.childSensorId = 255
                    msgOut.subType = this.internal
                }
                send(msgOut)
                done()
            })
        },
    )

    RED.httpAdmin.get(
        '/mysensordefs/:id',
        RED.auth.needsPermission(''),
        (req, res) => {
            const type = req.params.id

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let mysVal: any

            switch (type) {
            case 'subtype':
                mysVal = mysensor_data
                break
            case 'presentation':
                mysVal = mysensor_sensor
                break
            case 'internal':
                mysVal = mysensor_internal
                break
            }

            const kv = Object.keys(mysVal)
                .filter((k) => typeof mysVal[k] === 'number')
                .reduce((l: Record<string, number>, k) => {
                    if (typeof k !== 'number') {
                        l[k] = mysVal[k]
                    }
                    return l
                }, {})
            res.json(JSON.stringify(kv))
        },
    )
}

function getSensor(config: IEncapsulateProperties): IMysensorsMsg {
    const sensor: IMysensorsMsg = {
        _msgid: '',
        ack: config.ack ? 1 : 0,
        childSensorId: Number(config.childid),
        messageType: Number(config.msgtype),
        nodeId: Number(config.nodeid),
        payload: '',
        subType: Number(config.subtype),
    }
    return sensor
}
