import random, pytest
from pytezos import pytezos
from pytezos import ContractInterface, MichelsonRuntimeError

MAX_HEAVY_ITER = 10
MAX_LIGHT_ITER = 100
MAX_NUM = 10 ** 9
PRECISION = 10 ** 10
TARGET = './build/arithmetic.tz'

def test_sum():
    random.seed(42)
    contract = ContractInterface.from_file(TARGET)
    obj = contract.floatSum(None)
    for i in range(MAX_LIGHT_ITER):
        a, b = random.randint(0, MAX_NUM), random.randint(0, MAX_NUM)
        storage = obj.interpret(storage={'a' : a, 'b' : b, 'res' : 0}).storage
        assert a + b == storage['res']


def test_sub():
    random.seed(42)
    contract = ContractInterface.from_file(TARGET)
    obj = contract.floatSub(None)
    for i in range(MAX_LIGHT_ITER):
        a, b = random.randint(0, MAX_NUM), random.randint(0, MAX_NUM)
        if a < b:
            with pytest.raises(MichelsonRuntimeError) as error:
                storage = obj.interpret(storage={'a' : a, 'b' : b, 'res' : 0}).storage
            assert "Negative number couldn't be represented in nat" in str(error)
        else:
            storage = obj.interpret(storage={'a' : a, 'b' : b, 'res' : 0}).storage
            assert a - b == storage['res']


def test_div():
    random.seed(42)
    contract = ContractInterface.from_file(TARGET)
    obj = contract.floatDiv(None)
    for i in range(MAX_LIGHT_ITER):
        a, b = random.randint(0, MAX_NUM), random.randint(0, MAX_NUM)
        storage = obj.interpret(storage={'a' : a, 'b' : b, 'res' : 0}).storage
        assert a * PRECISION // b == storage['res']
    

def test_mul():
    random.seed(42)
    contract = ContractInterface.from_file(TARGET)
    obj = contract.floatMul(None)
    for i in range(MAX_LIGHT_ITER):
        a, b = random.randint(0, MAX_NUM), random.randint(0, MAX_NUM)
        storage = obj.interpret(storage={'a' : a, 'b' : b, 'res' : 0}).storage
        assert a * b // PRECISION == storage['res']


def test_pow():
    random.seed(42)
    contract = ContractInterface.from_file(TARGET)
    obj = contract.floatPow(None)
    for i in range(MAX_HEAVY_ITER):
        a, pw = random.randint(0, 100) / 123, random.randint(0, 100) / 57
        storage = obj.interpret(storage={'a' : int(a * PRECISION), 'b' : int(pw * PRECISION), 'res' : 0}).storage
        assert abs(a ** pw - storage['res'] / PRECISION) < 1e-3


