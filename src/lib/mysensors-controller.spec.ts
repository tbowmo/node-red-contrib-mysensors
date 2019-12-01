import { expect } from 'chai';
import { IDatabase } from 'node-red-contrib-mysensors/src/lib/database.interface';
import * as sinon from 'sinon';

import { DatabaseSqlite } from './database-sqlite';
import { MysensorsController } from './mysensors-controller';
import { IMysensorsMsg } from './mysensors-msg';
import { mysensor_command, mysensor_internal } from './mysensors-types';

describe('Controller test', () => {
    let db: IDatabase;
    let controller: MysensorsController;
    sinon.stub(DatabaseSqlite.prototype, 'getFreeNodeId').resolves(777);
    db = new DatabaseSqlite('dummy');
    controller = new MysensorsController(db, true, true, 'CET', 'M', 'mys-out');

    it('MQTT ID Request', async () => {
        const input: IMysensorsMsg = {
            payload: '',
            topic: 'mys-in/255/255/3/0/3',
        };
        const expected: IMysensorsMsg = {
            payload: '777',
            subType: mysensor_internal.I_ID_RESPONSE,
            topicRoot: 'mys-out',
        };
        const result = await controller.messageHandler(input);
        expect(result).to.include(expected);
    });

    it('Serial config request', async () => {
        const expected: IMysensorsMsg = {
            payload: '255;255;3;0;6;M',
        };
        const request: IMysensorsMsg = {payload: '255;255;3;0;6;0'};

        expect(await controller.messageHandler(request)).to.include(expected);
    });

    it('Decoded time request', async () => {
        const request: IMysensorsMsg = {
            ack: 0,
            childSensorId: 255,
            messageType: mysensor_command.C_INTERNAL,
            nodeId: 10,
            payload: '',
            subType: mysensor_internal.I_TIME,
        };

        const expected: IMysensorsMsg = {
            payload: '',
            subType: mysensor_internal.I_TIME,
        };

        expect(await controller.messageHandler(request)).to.include.keys(expected);
    });

    it('updates database uppon reception of package', async () => {
        const spy = sinon.spy(DatabaseSqlite.prototype, 'nodeHeard');
        await controller.messageHandler({payload: '10;255;3;0;6;0'});
        expect(spy.called).to.eq(true);
    });
});
