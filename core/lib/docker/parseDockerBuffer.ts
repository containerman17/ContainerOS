enum STREAM_TYPE {
    stdin = 0,
    stdout,
    stderr
}

export default function parseDockerBuffer(buffer: Buffer, extractTimestamp: boolean) {
    const result = []
    let info: Buffer, theRest: Buffer, contentSize: number, content: string, tsString: String

    theRest = Buffer.allocUnsafe(buffer.length);
    buffer.copy(theRest)

    for (let i = 0; i < 50000; i++) {//TODO infinite loop protection
        info = theRest.slice(0, 8)
        theRest = theRest.slice(8)
        contentSize = info.readUIntBE(4, 4)

        if (extractTimestamp) {
            tsString = theRest.slice(0, 30).toString('utf-8') // first 30 bytes
            content = theRest.slice(32, contentSize - 1).toString('utf-8')//after date, before \n
        } else {
            content = theRest.slice(0, contentSize - 1).toString('utf-8')//before \n
        }

        result.push({
            type: STREAM_TYPE[info[0]],
            content, ts: tsString
        })

        theRest = theRest.slice(contentSize)

        if (theRest.length <= 8) break;
    }

    return result
}