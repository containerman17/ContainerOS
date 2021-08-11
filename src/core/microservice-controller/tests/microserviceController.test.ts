import { expect } from "chai"
import sinon from "sinon"
import { database } from "containeros-sdk"
import microserviceController from "../microserviceController"

describe('Microservice controller', () => {
    afterEach(() => {
        sinon.restore()
    })

    it('has to stop and start on consul leader changed', (done) => {
        const addListChangedCallback = sinon.replace(database.microservice, "addListChangedCallback", sinon.fake())
        const removeListChangedCallback = sinon.replace(database.microservice, "removeListChangedCallback", sinon.fake())

        sinon.stub(database.consulLib, "onLeaderChanged").callsFake(function fakeFn(cb) {
            cb('127.0.0.1', true)
            expect(addListChangedCallback.callCount).to.be.equal(1)
            expect(removeListChangedCallback.callCount).to.be.equal(0)// not called

            cb('127.0.0.1', false)
            expect(addListChangedCallback.callCount).to.be.equal(1)
            expect(removeListChangedCallback.callCount).to.be.equal(1)

            cb('127.0.0.1', true)
            expect(addListChangedCallback.callCount).to.be.equal(2)
            expect(removeListChangedCallback.callCount).to.be.equal(1)

            done()
        });

        microserviceController.start()
    })

})
