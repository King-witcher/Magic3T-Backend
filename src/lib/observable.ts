// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventsMap = Record<string | number, any>

type EventNames<Map extends EventsMap> = keyof Map

type EventParams<
  Map extends EventsMap,
  Event extends EventNames<Map>,
> = Parameters<Map[Event]>

type Observer<Map extends EventsMap, Event extends EventNames<Map>> = (
  ...data: EventParams<Map, Event>
) => void

type ObserverMap<Map extends EventsMap> = {
  [Event in EventNames<Map>]?: Observer<Map, Event>[]
}

export interface IObservable<ObservableEventsMap extends EventsMap> {
  observe<Event extends EventNames<ObservableEventsMap>>(
    event: Event,
    observer: Observer<ObservableEventsMap, Event>,
  )
}

export abstract class Observable<ObservableEventsMap extends EventsMap>
  implements IObservable<ObservableEventsMap>
{
  private observers: ObserverMap<ObservableEventsMap> = {}

  public observe<Event extends EventNames<ObservableEventsMap>>(
    event: Event,
    observer: Observer<ObservableEventsMap, Event>,
  ) {
    this.observers[event] = [...(this.observers[event] || []), observer]
  }

  protected emit<Event extends EventNames<ObservableEventsMap>>(
    event: Event,
    ...data: EventParams<ObservableEventsMap, Event>
  ) {
    this.observers[event]?.forEach((observer) => observer(...data))
  }
}
