/* eslint-disable max-len */
import {
    mysensor_command,
    mysensor_data,
    mysensor_internal,
    mysensor_payload,
    mysensor_sensor,
    mysensor_stream,
} from './mysensors-types';

interface IMatch {
    re: string | RegExp
    d: string
}

export class MysensorsDebugDecode {

    private rprefix = '(?:\\d+ )?(?:mysgw: )?(?:Client 0: )?';

    private match: IMatch[] = [
        {
            re: 'MCO:BGN:INIT CP=([^,]+)',
            d: 'Core initialization with capabilities $1',
        },
        {
            re: 'MCO:BGN:INIT (\\w+),CP=([^,]+),VER=(.*)',
            d: 'Core initialization of  $1 , with capabilities $2, library version $3',
        },
        {
            re: 'MCO:BGN:BFR',
            d: 'Callback before()'
        },
        {
            re: 'MCO:BGN:STP',
            d: 'Callback setup()'
        },
        {
            re: 'MCO:BGN:INIT OK,TSP=(.*)',
            d: 'Core initialized, transport status  $1 , (1=initialized, 0=not initialized, NA=not available)',
        },
        {
            re: 'MCO:BGN:NODE UNLOCKED',
            d: 'Node successfully unlocked (see signing chapter)',
        },
        {
            re: '!MCO:BGN:TSP FAIL',
            d: 'Transport initialization failed'
        },
        {
            re: 'MCO:REG:REQ',
            d: 'Registration request'
        },
        {
            re: 'MCO:REG:NOT NEEDED',
            d: 'No registration needed (i.e. GW)'
        },
        {
            re: '!MCO:SND:NODE NOT REG',
            d: 'Node is not registered, cannot send message',
        },
        {
            re: 'MCO:PIM:NODE REG=(\\d+)',
            d: 'Registration response received, registration status  $1 ',
        },
        {
            re: 'MCO:PIM:ROUTE N=(\\d+),R=(\\d+)',
            d: 'Routing table, messages to node  $1  are routed via node  $2 ',
        },
        {
            re: 'MCO:SLP:MS=(\\d+),SMS=(\\d+),I1=(\\d+),M1=(\\d+),I2=(\\d+),M2=(\\d+)',
            d: 'Sleep node, duration  $1  ms, SmartSleep= $2 , Int1= $3 , Mode1= $4 , Int2= $5 , Mode2= $6 ',
        },
        {
            re: 'MCO:SLP:MS=(\\d+)',
            d: 'Sleep node, duration  $1  ms'
        },
        {
            re: 'MCO:SLP:TPD',
            d: 'Sleep node, powerdown transport'
        },
        {
            re: 'MCO:SLP:WUP=(-?\\d+)',
            d: 'Node woke-up, reason/IRQ= $1  (-2=not possible, -1=timer, >=0 IRQ)',
        },
        {
            re: '!MCO:SLP:FWUPD',
            d: 'Sleeping not possible, FW update ongoing'
        },
        {
            re: '!MCO:SLP:REP',
            d: 'Sleeping not possible, repeater feature enabled',
        },
        {
            re: '!MCO:SLP:TNR',
            d: ' Transport not ready, attempt to reconnect until timeout',
        },
        {
            re: 'MCO:NLK:NODE LOCKED. UNLOCK: GND PIN (\\d+) AND RESET',
            d: 'Node locked during booting, see signing documentation for additional information',
        },
        {
            re: 'MCO:NLK:TPD',
            d: 'Powerdown transport'
        },
        {
            re: 'TSM:INIT',
            d: 'Transition to  Init  state'
        },
        {
            re: 'TSM:INIT:STATID=(\\d+)',
            d: 'Init static node id  $1 '
        },
        {
            re: 'TSM:INIT:TSP OK',
            d: 'Transport device configured and fully operational',
        },
        {
            re: 'TSM:INIT:GW MODE',
            d: 'Node is set up as GW, thus omitting ID and findParent states',
        },
        {
            re: '!TSM:INIT:TSP FAIL',
            d: 'Transport device initialization failed',
        },
        {
            re: 'TSM:FPAR',
            d: 'Transition to  Find Parent  state'
        },
        {
            re: 'TSM:FPAR:STATP=(\\d+)',
            d: 'Static parent  $1  has been set, skip finding parent',
        },
        {
            re: 'TSM:FPAR:OK',
            d: 'Parent node identified'
        },
        {
            re: '!TSM:FPAR:NO REPLY',
            d: 'No potential parents replied to find parent request',
        },
        {
            re: '!TSM:FPAR:FAIL',
            d: 'Finding parent failed'
        },
        {
            re: 'TSM:ID',
            d: 'Transition to  Request Id  state'
        },
        {
            re: 'TSM:ID:OK,ID=(\\d+)',
            d: 'Node id  $1  is valid'
        },
        {
            re: 'TSM:ID:REQ',
            d: 'Request node id from controller'
        },
        {
            re: '!TSM:ID:FAIL,ID=(\\d+)',
            d: 'Id verification failed,  $1  is invalid',
        },
        {
            re: 'TSM:UPL',
            d: 'Transition to  Check Uplink  state'
        },
        {
            re: 'TSM:UPL:OK',
            d: 'Uplink OK, GW returned ping'
        },
        {
            re: '!TSM:UPL:FAIL',
            d: 'Uplink check failed, i.e. GW could not be pinged',
        },
        {
            re: 'TSM:READY:NWD REQ',
            d: 'Send transport network discovery request',
        },
        {
            re: 'TSM:READY:SRT',
            d: 'Save routing table'
        },
        {
            re: 'TSM:READY:ID=(\\d+),PAR=(\\d+),DIS=(\\d+)',
            d: 'Transport ready, node id  $1 , parent node id  $2 , distance to GW is  $3 ',
        },
        {
            re: '!TSM:READY:UPL FAIL,SNP',
            d: 'Too many failed uplink transmissions, search new parent',
        },
        {
            re: '!TSM:READY:FAIL,STATP',
            d: 'Too many failed uplink transmissions, static parent enforced',
        },
        {
            re: 'TSM:READY',
            d: 'Transition to  Ready  state'
        },
        {
            re: 'TSM:FAIL:DIS',
            d: 'Disable transport'
        },
        {
            re: 'TSM:FAIL:CNT=(\\d+)',
            d: 'Transition to  Failure  state, consecutive failure counter is  $1 ',
        },

        { re: 'TSM:FAIL:PDT', d: 'Power-down transport' },
        { re: 'TSM:FAIL:RE-INIT', d: 'Attempt to re-initialize transport' },
        {
            re: 'TSF:CKU:OK,FCTRL',
            d: 'Uplink OK, flood control prevents pinging GW in too short intervals',
        },
        { re: 'TSF:CKU:OK', d: 'Uplink OK' },
        {
            re: 'TSF:CKU:DGWC,O=(\\d+),N=(\\d+)',
            d: 'Uplink check revealed changed network topology, old distance  $1 , new distance  $2 ',
        },
        { re: 'TSF:CKU:FAIL', d: 'No reply received when checking uplink' },
        { re: 'TSF:SID:OK,ID=(\\d+)', d: 'Node id  $1  assigned' },
        { re: '!TSF:SID:FAIL,ID=(\\d+)', d: 'Assigned id  $1  is invalid' },
        { re: 'TSF:PNG:SEND,TO=(\\d+)', d: 'Send ping to destination  $1 ' },
        {
            re: 'TSF:WUR:MS=(\\d+)',
            d: 'Wait until transport ready, timeout  $1 ',
        },
        { re: 'TSF:MSG:ACK REQ', d: 'ACK message requested' },
        {
            re: 'TSF:MSG:ACK',
            d: 'ACK message, do not proceed but forward to callback',
        },
        {
            re: 'TSF:MSG:FPAR RES,ID=(\\d+),D=(\\d+)',
            d: 'Response to find parent request received from node  $1  with distance  $2  to GW',
        },
        {
            re: 'TSF:MSG:FPAR PREF FOUND',
            d: 'Preferred parent found, i.e. parent defined via MY_PARENT_NODE_ID',
        },
        {
            re: 'TSF:MSG:FPAR OK,ID=(\\d+),D=(\\d+)',
            d: 'Find parent response from node  $1  is valid, distance  $2  to GW',
        },
        {
            re: 'TSF:MSG:FPAR INACTIVE',
            d: 'Find parent response received, but no find parent request active, skip response',
        },
        {
            re: 'TSF:MSG:FPAR REQ,ID=(\\d+)',
            d: 'Find parent request from node  $1 ',
        },
        {
            re: 'TSF:MSG:PINGED,ID=(\\d+),HP=(\\d+)',
            d: 'Node pinged by node  $1  with  $2  hops',
        },
        {
            re: 'TSF:MSG:PONG RECV,HP=(\\d+)',
            d: 'Pinged node replied with  $1  hops',
        },
        { re: 'TSF:MSG:BC', d: 'Broadcast message received' },
        { re: 'TSF:MSG:GWL OK', d: 'Link to GW ok' },
        {
            re: 'TSF:MSG:FWD BC MSG',
            d: 'Controlled broadcast message forwarding',
        },
        { re: 'TSF:MSG:REL MSG', d: 'Relay message' },
        {
            re: 'TSF:MSG:REL PxNG,HP=(\\d+)',
            d: 'Relay PING/PONG message, increment hop counter to  $1 ',
        },
        {
            re: '!TSF:MSG:LEN,(\\d+)!=(\\d+)',
            d: 'Invalid message length,  $1  (actual) !=  $2  (expected)',
        },
        {
            re: '!TSF:MSG:PVER,(\\d+)!=(\\d+)',
            d: 'Message protocol version mismatch,  $1  (actual) !=  $2  (expected)',
        },
        { re: '!TSF:MSG:SIGN VERIFY FAIL', d: 'Signing verification failed' },
        {
            re: '!TSF:MSG:REL MSG,NORP',
            d: 'Node received a message for relaying, but node is not a repeater, message skipped',
        },
        { re: '!TSF:MSG:SIGN FAIL', d: 'Signing message failed' },
        { re: '!TSF:MSG:GWL FAIL', d: 'GW uplink failed' },
        { re: '!TSF:MSG:ID TK INVALID', d: 'Token for ID request invalid' },
        { re: 'TSF:SAN:OK', d: 'Sanity check passed' },
        {
            re: '!TSF:SAN:FAIL',
            d: 'Sanity check failed, attempt to re-initialize radio',
        },
        { re: 'TSF:CRT:OK', d: 'Clearing routing table successful' },
        { re: 'TSF:LRT:OK', d: 'Loading routing table successful' },
        { re: 'TSF:SRT:OK', d: 'Saving routing table successful' },
        {
            re: '!TSF:RTE:FPAR ACTIVE',
            d: 'Finding parent active, message not sent',
        },
        {
            re: '!TSF:RTE:DST (\\d+) UNKNOWN',
            d: 'Routing for destination  $1  unknown, sending message to parent',
        },
        {
            re: 'TSF:RRT:ROUTE N=(\\d+),R=(\\d+)',
            d: 'Routing table, messages to node ( $1 ) are routed via node ( $2 )',
        },
        {
            re: '!TSF:SND:TNR',
            d: 'Transport not ready, message cannot be sent',
        },
        { re: 'TSF:TDI:TSL', d: 'Set transport to sleep' },
        { re: 'TSF:TDI:TPD', d: 'Power down transport' },
        { re: 'TSF:TRI:TRI', d: 'Reinitialise transport' },
        { re: 'TSF:TRI:TSB', d: 'Set transport to standby' },
        {
            re: 'TSF:SIR:CMD=(\\d+),VAL=(\\d+)',
            d: 'Get signal report  $1 , value:  $2 ',
        },
        {
            re: 'TSF:MSG:READ,(\\d+)-(\\d+)-(\\d+),s=(\\d+),c=(\\d+),t=(\\d+),pt=(\\d+),l=(\\d+),sg=(\\d+):(.*)',
            d: ' Received Message \r Sender : $1\r Last Node : $2\r Destination : $3\r Sensor Id : $4\r Command : {command:$5}\r Message Type : {type:$5:$6}\r Payload Type : {pt:$7}\r Payload Length : $8\r Signing : $9\r Payload : $10',
        },
        {
            re: 'TSF:MSG:SEND,(\\d+)-(\\d+)-(\\d+)-(\\d+),s=(\\d+),c=(\\d+),t=(\\d+),pt=(\\d+),l=(\\d+),sg=(\\d+),ft=(\\d+),st=(\\w+):(.*)',
            d: ' Sent Message \r Sender : $1\r Last Node : $2\r Next Node : $3\r Destination : $4\r Sensor Id : $5\r Command : {command:$6}\r Message Type :{type:$6:$7}\r Payload Type : {pt:$8}\r Payload Length : $9\r Signing : $10\r Failed uplink counter : $11\r Status : $12 (OK=success, NACK=no radio ACK received)\r Payload : $13',
        },
        {
            re: '!TSF:MSG:SEND,(\\d+)-(\\d+)-(\\d+)-(\\d+),s=(\\d+),c=(\\d+),t=(\\d+),pt=(\\d+),l=(\\d+),sg=(\\d+),ft=(\\d+),st=(\\w+):(.*)',
            d: '<b style=\'color:red\'>Sent Message \r Sender : $1\r Last Node : $2\r Next Node : $3\r Destination : $4\r Sensor Id : $5\r Command : {command:$6}\r Message Type :{type:$6:$7}\r Payload Type : {pt:$8}\r Payload Length : $9\r Signing : $10\r Failed uplink counter : $11\r Status : $12 (OK=success, NACK=no radio ACK received)\r Payload : $13',
        },

        // Signing backend

        { re: 'SGN:INI:BND OK', d: 'Backend has initialized ok' },
        { re: '!SGN:INI:BND FAIL', d: 'Backend has not initialized ok' },
        { re: 'SGN:PER:OK', d: 'Personalization data is ok' },
        {
            re: '!SGN:PER:TAMPERED',
            d: 'Personalization data has been tampered',
        },
        { re: 'SGN:PRE:SGN REQ', d: 'Signing required' },
        {
            re: 'SGN:PRE:SGN REQ,TO=(\\d+)',
            d: 'Tell node  $1  that we require signing',
        },
        { re: 'SGN:PRE:SGN REQ,FROM=(\\d+)', d: ' Node  $1  require signing' },
        { re: 'SGN:PRE:SGN NREQ', d: 'Signing not required' },
        {
            re: 'SGN:PRE:SGN REQ,TO=(\\d+)',
            d: 'Tell node  $1  that we do not require signing',
        },
        {
            re: 'SGN:PRE:SGN NREQ,FROM=(\\d+)',
            d: 'Node  $1  does not require signing',
        },
        {
            re: '!SGN:PRE:SGN NREQ,FROM=(\\d+) REJ',
            d: 'Node  $1  does not require signing but used to (requirement remain unchanged)',
        },
        { re: 'SGN:PRE:WHI REQ', d: 'Whitelisting required' },
        {
            re: 'SGN:PRE:WHI REQ;TO=(\\d+)',
            d: 'Tell  $1  that we require whitelisting',
        },
        {
            re: 'SGN:PRE:WHI REQ,FROM=(\\d+)',
            d: 'Node  $1  require whitelisting',
        },
        { re: 'SGN:PRE:WHI NREQ', d: ' Whitelisting not required' },
        {
            re: 'SGN:PRE:WHI NREQ,TO=(\\d+)',
            d: 'Tell node  $1  that we do not require whitelisting',
        },
        {
            re: 'SGN:PRE:WHI NREQ,FROM=(\\d+)',
            d: 'Node  $1  does not require whitelisting',
        },
        {
            re: '!SGN:PRE:WHI NREQ,FROM=(\\d+) REJ',
            d: 'Node  $1  does not require whitelisting but used to (requirement remain unchanged)',
        },
        {
            re: 'SGN:PRE:XMT,TO=(\\d+)',
            d: 'Presentation data transmitted to node  $1 ',
        },
        {
            re: '!SGN:PRE:XMT,TO=(\\d+) FAIL',
            d: 'Presentation data not properly transmitted to node  $1 ',
        },
        { re: 'SGN:PRE:WAIT GW', d: 'Waiting for gateway presentation data' },
        {
            re: '!SGN:PRE:VER=(\\d+)',
            d: 'Presentation version  $1  is not supported',
        },
        {
            re: 'SGN:PRE:NSUP',
            d: 'Received signing presentation but signing is not supported',
        },
        {
            re: 'SGN:PRE:NSUP,TO=(\\d+)',
            d: 'Informing node  $1  that we do not support signing',
        },
        {
            re: 'SGN:SGN:NCE REQ,TO=(\\d+)',
            d: 'Nonce request transmitted to node  $1 ',
        },
        {
            re: '!SGN:SGN:NCE REQ,TO=(\\d+) FAIL',
            d: 'Nonce request not properly transmitted to node  $1 ',
        },
        { re: '!SGN:SGN:NCE TMO', d: 'Timeout waiting for nonce' },
        { re: 'SGN:SGN:SGN', d: 'Message signed' },
        { re: '!SGN:SGN:SGN FAIL', d: 'Message failed to be signed' },
        {
            re: 'SGN:SGN:NREQ=(\\d+)',
            d: 'Node  $1  does not require signed messages',
        },
        {
            re: 'SGN:SGN:(\\d+)!=(\\d+) NUS',
            d: 'Will not sign because  $1  is not  $2  (repeater)',
        },
        {
            re: '!SGN:SGN:STATE',
            d: 'Security system in a invalid state (personalization data tampered)',
        },
        {
            re: '!SGN:VER:NSG',
            d: 'Message was not signed, but it should have been',
        },
        { re: '!SGN:VER:FAIL', d: 'Verification failed' },
        { re: 'SGN:VER:OK', d: 'Verification succeeded' },
        {
            re: 'SGN:VER:LEFT=(\\d+)',
            d: ' $1  number of failed verifications left in a row before node is locked',
        },
        {
            re: '!SGN:VER:STATE',
            d: 'Security system in a invalid state (personalization data tampered)',
        },
        {
            re: 'SGN:SKP:MSG CMD=(\\d+),TYPE=(\\d+)',
            d: 'Message with command  $1  and type  $1  does not need to be signed',
        },
        {
            re: 'SGN:SKP:ACK CMD=(\\d+),TYPE=(\\d+)',
            d: 'ACK messages does not need to be signed',
        },
        {
            re: 'SGN:NCE:LEFT=(\\d+)',
            d: ' $1  number of nonce requests between successful verifications left before node is locked',
        },
        {
            re: 'SGN:NCE:XMT,TO=(\\d+)',
            d: 'Nonce data transmitted to node  $1 ',
        },
        {
            re: '!SGN:NCE:XMT,TO=(\\d+) FAIL',
            d: 'Nonce data not properly transmitted to node  $1 ',
        },
        { re: '!SGN:NCE:GEN', d: 'Failed to generate nonce' },
        {
            re: 'SGN:NCE:NSUP (DROPPED)',
            d: 'Ignored nonce/request for nonce (signing not supported)',
        },
        { re: 'SGN:NCE:FROM=(\\d+)', d: 'Received nonce from node  $1 ' },
        {
            re: 'SGN:NCE:(\\d+)!=(\\d+) (DROPPED)',
            d: 'Ignoring nonce as it did not come from the desgination of the message to sign',
        },
        { re: '!SGN:BND:INIT FAIL', d: 'Failed to initialize signing backend' },
        { re: '!SGN:BND:PWD<8', d: 'Signing password too short' },
        { re: '!SGN:BND:PER', d: 'Backend not personalized' },
        {
            re: '!SGN:BND:SER',
            d: 'Could not get device unique serial from backend',
        },
        { re: '!SGN:BND:TMR', d: 'Backend timed out' },
        {
            re: '!SGN:BND:SIG,SIZE,(\\d+)>(\\d+)',
            d: 'Refusing to sign message with length  $1  because it is bigger than allowed size  $2  ',
        },
        {
            re: 'SGN:BND:SIG WHI,ID=(\\d+)',
            d: 'Salting message with our id  $1 ',
        },
        {
            re: 'SGN:BND:SIG WHI,SERIAL=(.*)',
            d: 'Salting message with our serial  $1 ',
        },
        {
            re: '!SGN:BND:VER ONGOING',
            d: 'Verification failed, no ongoing session',
        },
        {
            re: '!SGN:BND:VER,IDENT=(\\d+)',
            d: 'Verification failed, identifier  $1  is unknown',
        },
        { re: 'SGN:BND:VER WHI,ID=(\\d+)', d: 'Id  $1  found in whitelist' },
        {
            re: 'SGN:BND:VER WHI,SERIAL=(.*)',
            d: 'Expecting serial  $1  for this sender',
        },
        {
            re: '!SGN:BND:VER WHI,ID=(\\d+) MISSING',
            d: 'Id  $1  not found in whitelist',
        },
        {
            re: 'SGN:BND:NONCE=(.*)',
            d: 'Calculating signature using nonce  $1 ',
        },
        { re: 'SGN:BND:HMAC=(.*)', d: 'Calculated signature is  $1 ' },
    ];

    constructor() {
        for (let i = 0, len = this.match.length; i < len; i++) {
            this.match[i].re = new RegExp('^' + this.rprefix + this.match[i].re);
        }
    }

    public decode(msg: string): string | undefined {
        for (const r of this.match) {
            if (r.re instanceof RegExp && r.re.test(msg)) {
                let outStr = msg.replace(r.re, r.d);
                outStr = outStr.replace(
                    /{command:(\d+)}/g,
                    (__, m1) => mysensor_command[m1],
                );
                outStr = outStr.replace(
                    /{pt:(\d+)}/g,
                    (__, m1) => mysensor_payload[m1],
                );
                return outStr.replace(
                    /{type:(\d+):(\d+)}/g,
                    (__, cmd, type) => {
                        return this.type(Number(cmd), Number(type));
                    },
                );
            }
        }
    }

    private type(cmd: mysensor_command, type: number): string {
        switch (cmd) {
            case mysensor_command.C_REQ:
            case mysensor_command.C_SET:
                return mysensor_data[type];
            case mysensor_command.C_INTERNAL:
                return mysensor_internal[type];
            case mysensor_command.C_PRESENTATION:
                return mysensor_sensor[type];
            case mysensor_command.C_STREAM:
                return mysensor_stream[type];
        }
        return '';
    }
}
