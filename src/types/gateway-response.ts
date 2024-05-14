import { EventNames, EventParams, EventsMap } from 'socket.io/dist/typed-events'

export type GatewayResponse<
  EmitEventsMap extends EventsMap,
  Event extends EventNames<EmitEventsMap>,
> = {
  event: Event
  data: EventParams<EmitEventsMap, Event>
}
