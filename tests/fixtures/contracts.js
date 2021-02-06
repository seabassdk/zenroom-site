const zencodeKeyPairGen =
    `Scenario 'ecdh': Create the keypair
Given that I am known as 'Alice'
When I create the keypair
Then print my data`;

export const keys1 = {
    "myName": "User123456"
}

export const conf1 = {
    "confA": "Some configuration",
    "confB": "Some configuration"
}

export const contract1 = {
    name: 'first key pair',
    zencode: zencodeKeyPairGen,
    keys: '',
    data: '',
    config: '',
    username: ''
}

export const contract2 = {
    name: 'second key pair',
    zencode: zencodeKeyPairGen,
    keys: '',
    data: '',
    config: '',
    username: ''
}