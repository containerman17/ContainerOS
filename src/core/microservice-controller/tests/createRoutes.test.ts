import { expect } from "chai"
import setUpNode from "../../set-up-node/setUpNode"
import sinon from "sinon"
import database from "../../../lib/database"
import microserviceController from '../microserviceController'

describe('Route controller', () => {
    before(async () => {
        await setUpNode()
        sinon.replace(database.nodeHealth, "getLeastBusyServerName", sinon.fake.returns(Promise.resolve('fake-server')))
    })

    beforeEach(async () => {
        await database.microservice.dropAll()
        await database.routes.dropAll()

        await database.routes.ready()
        await database.microservice.ready()

        expect(Object.values(await database.routes.getAll())).to.have.length(0, 'route reset failed')
        expect(Object.values(await database.microservice.getAll())).to.have.length(0, 'microservice reset failed')
    })


    after(async () => {
        sinon.restore()
        await database.microservice.dropAll()
        await database.routes.dropAll()
    })

    afterEach(() => {
        microserviceController.stop()
    })

    it('creates an route for every port of every container of every microservice', async () => {
        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms',
                scale: 1,
                containers: {
                    'test-cont': {
                        httpPorts: {
                            80: 'eighty.test',
                            8080: 'eightyeighty.test'
                        },
                        memLimit: 1000000,
                        cpus: 100000,
                        env: [],
                        image: "hello-world",
                    }
                }
            },
            currentPodNames: []
        })
        await microserviceController.start()

        const routeList = await database.routes.getAll()
        expect(Object.values(routeList).length).to.equal(2)

        for (let [routeName, routeValue] of Object.entries(routeList)) {
            expect(routeName).to.equal(routeValue.service)

            if (routeName.startsWith('test-ms-test-cont-80-')) {
                expect(routeValue.domain).to.equal('eighty.test')
            } else if (routeName.startsWith('test-ms-test-cont-8080-')) {
                expect(routeValue.domain).to.equal('eightyeighty.test')
            } else {
                expect(true).to.be.false('Unexpected route name')
            }
        }
    })

    it('kills route for microservice scale=0', async () => {
        let routeList

        routeList = await database.routes.getAll()
        expect(Object.values(routeList).length).to.equal(0, 'on init')

        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms',
                scale: 0,
                containers: {
                    'test-cont': {
                        httpPorts: {
                            80: 'eighty.test',
                            8080: 'eightyeighty.test'
                        },
                        memLimit: 1000000,
                        cpus: 100000,
                        env: [],
                        image: "hello-world",
                    }
                }
            },
            currentPodNames: []
        })
        await microserviceController.start()

        routeList = await database.routes.getAll()
        expect(Object.values(routeList).length).to.equal(0, 'after update')
    })
    it('avoids naming conflict', async () => {
        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms',
                scale: 1,
                containers: {
                    'cont1': {
                        httpPorts: {
                            80: 'first.test',
                        },
                        memLimit: 1000000,
                        cpus: 100000,
                        env: [],
                        image: "hello-world",
                    }
                }
            },
            currentPodNames: []
        })
        await database.microservice.update('test', {
            currentConfig: {
                name: 'test',
                scale: 1,
                containers: {
                    'ms-cont1': {
                        httpPorts: {
                            80: 'second.test',
                        },
                        memLimit: 1000000,
                        cpus: 100000,
                        env: [],
                        image: "hello-world",
                    }
                }
            },
            currentPodNames: []
        })
        await microserviceController.start()

        const routeList = await database.routes.getAll()
        expect(Object.values(routeList).length).to.equal(2)
    })
})