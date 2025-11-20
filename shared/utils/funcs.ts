export function listGenerate<T>(length: number, generator: (i: number) => T): T[] {
    const list: T[] = [];
    for (let i = 0; i < length; i++) {
        list.push(generator(i));
    }
    return list;
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function remap(v: number, domain: [number, number], newDomain: [number, number]): number {
    return newDomain[0] + (v - domain[0]) * ((newDomain[1] - newDomain[0]) / (domain[1] - domain[0]));
}