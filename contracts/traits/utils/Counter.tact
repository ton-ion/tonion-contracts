/**
 * @title Counter
 * @author Zig Balthazar (@zigbalthazar)
 * @dev Provides counter that can only be incremented or decremented by one. This can be used e.g. to track the number
 * of elements in a mapping, issuing NFT ids, or counting request ids.
 */

trait Counter {
    /**
     * This variable should never be directly accessed by users of the library: interactions must be restricted to
     * the library's function.
     */
    Counter: Int; // default: 0

    get fun current(): Int {
        return self.Counter;
    }

    fun increment() {
        self.Counter += 1;
    }

    fun decrement() {
        self.Counter -= 1;
    }
}