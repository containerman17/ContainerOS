class ClassWithPrivateField {
    #privateField;

    constructor() {
        this.#privateField = 42;
    }
}

class SubClass extends ClassWithPrivateField {
    #subPrivateField;

    constructor() {
        super();
        this.#subPrivateField = 23;
        console.log('#subPrivateField', this.#subPrivateField)
        console.log('#privateField', this.#privateField)
    }
}

new SubClass();