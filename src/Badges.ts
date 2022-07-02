
export interface BadgeData {
    value: string;
}

export class Badges {
    private data: BadgeData = {
        value: "hello"
    };

    constructor() {

    }

    setData(data: BadgeData) {
        this.data = data;
    }

    toJson(): BadgeData {
        return this.data;
    }
}
