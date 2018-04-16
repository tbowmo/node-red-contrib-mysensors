// import {ISettings} from 'node-red-interfaces';

declare module MySensors {
  
  export interface IMessage {
    topicRoot?: string;
    nodeId: number;
    childSensorId: number;
    messageType: number;
    ack: number;
    subType: number;
    topic?: string;
    payload: string;
  }
}
