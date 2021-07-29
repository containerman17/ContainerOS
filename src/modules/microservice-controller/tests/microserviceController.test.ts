import { expect } from "chai"
import sinon from "sinon"
import database from "../../../lib/database"
import microserviceController from "../microserviceController"

describe('general microservice controller behavior', () => {
    afterEach(() => {
        sinon.restore()
    })

    it.only('has to stop and start', (done) => {
        let callbacks = []
        const addListChangedCallback = sinon.replace(database.microservice, "addListChangedCallback", sinon.fake())
        const removeListChangedCallback = sinon.replace(database.microservice, "removeListChangedCallback", sinon.fake())

        sinon.stub(database.system, "onLeaderChanged").callsFake(function fakeFn(cb) {
            cb('127.0.0.1', true)
            expect(addListChangedCallback.callCount).to.be.equal(1)
            expect(removeListChangedCallback.callCount).to.be.equal(0)// not called

            cb('127.0.0.1', false)
            expect(addListChangedCallback.callCount).to.be.equal(1)
            expect(removeListChangedCallback.callCount).to.be.equal(1)

            console.log('before twice', addListChangedCallback.__proto)

            cb('127.0.0.1', true)
            expect(addListChangedCallback.callCount).to.be.equal(2)
            expect(removeListChangedCallback.callCount).to.be.equal(1)

            done()
        });

        microserviceController.start()
    })

    // let callbacks = []
    // sinon.stub(database.system, "onLeaderChanged").callsFake(function fakeFn(cb) {
    //     return "bar";
    // });
})

it('starts and stops on consul leader changed', () => { })