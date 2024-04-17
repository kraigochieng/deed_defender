# Contract Type
from algopy import ARC4Contract

# Methods
from algopy import subroutine

# Data Types
from algopy import UInt64

# Modules
from algopy import arc4

# Logging
from algopy import log

# Transactions
from algopy import Txn

class Counter(ARC4Contract):
    def __init__(self) -> None:
        self.counter = UInt64(0)
        # self.my_array = arc4.DynamicArray[arc4.UInt64]

    @arc4.abimethod()
    def invoke_increment_counter(self) -> UInt64:
        self.increment_counter()
        log(self.counter)
        
        return self.counter
        
    
    @subroutine
    def increment_counter(self) -> None:
        self.counter += 1

    @arc4.abimethod()
    def decrement_counter(self) -> UInt64:
        if(self.counter == 0):
            return UInt64(0)
        
        self.counter -= 1
        
        log(self.counter)
        return self.counter