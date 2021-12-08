interface User {
    name: string;
    id: number;
}

setInterval(() => {
    const user: User = {
        name: 'John ' + new Date().getMilliseconds(),
        id: 1,
    };

    console.log('Hello World', user);
}, 2000)