// Cairo 2.3.0-rc0
use core::option::OptionTrait;
use core::result::ResultTrait;
use integer::{U8IntoFelt252, U32IntoFelt252, Felt252TryIntoU32};
use array::{Span, SpanTrait, ArrayTrait};
use serde::Serde;
use integer::U32DivRem;
use starknet::{storage_read_syscall, storage_write_syscall, SyscallResult, SyscallResultTrait};
use starknet::storage_access::{
    Store, StorageAddress, StorageBaseAddress, storage_address_to_felt252,
    storage_address_from_base, storage_address_from_base_and_offset,
    storage_base_address_from_felt252
};
use traits::{Into, TryInto};

#[starknet::interface]
trait IstorageFelts<TContractState> {
    fn get_size_bytes(self: @TContractState) -> u64;
    fn get_bits_len_bytes(self: @TContractState) -> u16;
    fn get_file(self: @TContractState) -> BinaryFile;
}

#[derive(Copy, Drop, Serde)]
struct BinaryFile {
    size_bytes: u64,
    bits_len: u16,
    len: usize,
    numbers: Span<felt252>,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct StoreFile {
    numbers: Span<felt252>,
}


// from https://gist.github.com/jessupjn/e23180b4794d6c33cb43bd37d3d2f03e
impl StoreSpan<
    S, impl SCopy: Copy<S>, impl SDrop: Drop<S>, impl SStore: Store<S>
> of Store<Span<S>> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult::<Span<S>> {
        let span_len: u32 = Store::<usize>::read(address_domain, base)?;
        _span_read_helper::<S>(address_domain, storage_address_from_base(base), span_len)
    }

    fn write(address_domain: u32, base: StorageBaseAddress, value: Span<S>) -> SyscallResult::<()> {
        Store::write(address_domain, base, value.len());
        _span_write_helper::<S>(address_domain, storage_address_from_base(base), value)
    }

    fn read_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<Span<S>> {
        let span_len: u32 = Store::<usize>::read_at_offset(address_domain, base, offset)?;
        let storage_address = storage_address_from_base_and_offset(base, offset);
        _span_read_helper::<S>(address_domain, storage_address, span_len)
    }

    fn write_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: Span<S>
    ) -> SyscallResult<()> {
        Store::write_at_offset(address_domain, base, offset, value.len());
        let storage_address = storage_address_from_base_and_offset(base, offset);
        _span_write_helper(address_domain, storage_address, value)
    }

    fn size() -> u8 {
        Store::<usize>::size()
    }
}

fn _span_read_helper<S, impl SCopy: Copy<S>, impl SDrop: Drop<S>, impl SStore: Store<S>>(
    address_domain: u32, storage_address: StorageAddress, span_len: usize
) -> SyscallResult<Span<S>> {
    let mut index = 0;
    let mut returned: Array<S> = array![];
    loop {
        // Once the returned array reaches the expected size, break. This is at the head of the loop to address the case of len == 0.
        if returned.len() == span_len {
            break ();
        }

        let (base, offset) = _calculate_base_and_offset_for_index(
            storage_address, index, Store::<S>::size()
        );
        match (Store::<S>::read_at_offset(address_domain, base, offset)) {
            Result::Ok(r) => returned.append(r),
            Result::Err(e) => panic(e)
        }
        index += 1;
    };
    SyscallResult::Ok(returned.span())
}

fn _span_write_helper<S, impl SCopy: Copy<S>, impl SDrop: Drop<S>, impl SStore: Store<S>>(
    address_domain: u32, storage_address: StorageAddress, mut span: Span<S>
) -> SyscallResult<()> {
    let mut index = 0;
    loop {
        match span.pop_front() {
            Option::Some(el) => {
                let (base, offset) = _calculate_base_and_offset_for_index(
                    storage_address, index, Store::<S>::size()
                );
                Store::<S>::write_at_offset(address_domain, base, offset, *el);
                index += 1;
            },
            Option::None(_) => {
                break;
            },
        };
    };
    Result::Ok(())
}

fn _calculate_base_and_offset_for_index(
    storage_address: StorageAddress, index: u32, storage_size: u8
) -> (StorageBaseAddress, u8) {
    let max_elements: usize = 256 / storage_size.into();
    let (key, offset) = U32DivRem::div_rem(index, max_elements.try_into().unwrap());

    // hash the base address and the key which is the segment number
    let addr_elements = array![storage_address_to_felt252(storage_address), key.into()];
    let segment_base = storage_base_address_from_felt252(
        poseidon::poseidon_hash_span(addr_elements.span())
    );
    (segment_base, offset.try_into().unwrap() * storage_size)
}

#[starknet::contract]
mod StorageFelts {
    use array::{Span, SpanTrait};
    use super::{BinaryFile};
    use super::{StoreFile};


    #[storage]
    struct Storage {
        size_bytes: u64,
        bits_len: u16,
        data: StoreFile,
    }

    #[constructor]
    fn constructor(ref self: ContractState, file: BinaryFile) {
        self.size_bytes.write(file.size_bytes);
        self.bits_len.write(file.bits_len);
        let tmpData = StoreFile { numbers: file.numbers };
        self.data.write(tmpData);
    }

    #[external(v0)]
    impl TestFelt of super::IstorageFelts<ContractState> {
        fn get_size_bytes(self: @ContractState) -> u64 {
            self.size_bytes.read()
        }

        fn get_bits_len_bytes(self: @ContractState) -> u16 {
            self.bits_len.read()
        }

        fn get_file(self: @ContractState) -> BinaryFile {
            //let tmp_data=
            BinaryFile {
                size_bytes: self.size_bytes.read(),
                bits_len: self.bits_len.read(),
                len: self.data.read().numbers.len(),
                numbers: self.data.read().numbers
            }
        }
    }
}
