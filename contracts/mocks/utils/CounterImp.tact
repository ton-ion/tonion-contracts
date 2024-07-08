import "../../traits/utils/counter.tact";

contract CounterImp with Counter {
    Counter: Int;
    init(){
        self.Counter = 0;
    }

    receive("increment"){
        self.increment();
    }

    receive("decrement"){
        self.decrement();
    }

    receive("current"){
        self.current();
    }
}