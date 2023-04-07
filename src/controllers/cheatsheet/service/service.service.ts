import { Injectable } from '@nestjs/common';

@Injectable()
export class ServiceService {
    private count: number = 0

    call() {
        return ++this.count;
    }
}
