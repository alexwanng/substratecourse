// Tests to be written here

use crate::{Error, mock::*};
use frame_support::{assert_ok, assert_noop};
use super::*;

//test cases for create_claim
#[test]
fn create_claim_works() {

    new_test_ext().execute_with(|| {
        let claim = vec![0, 1];
        assert_ok!(PoeModule::create_claim(Origin::signed(1), claim.clone()));
        assert_eq!(Proofs::<Test>::get(&claim), (1, system::Module::<Test>::block_number()));
    })
}

// run tests with command: cargo test -p pallet-poe

#[test]
fn create_claim_failed_when_claim_already_exists() {
    new_test_ext().execute_with(|| {
        let claim = vec![0, 1];
        let _ = PoeModule::create_claim(Origin::signed(1), claim.clone());

        assert_noop!(
            PoeModule::create_claim(Origin::signed(1), claim.clone()),
            Error::<Test>::ProofAlreadyExist
        );
    })
}

#[test]
fn create_claim_failed_when_claim_is_too_long() {
    new_test_ext().execute_with(|| {
        // mock.rs MaxClaimLength is 6, we set 7 length here.
        let claim = vec![0, 1, 2, 3, 4, 5, 6];

        assert_noop!(
            PoeModule::create_claim(Origin::signed(1), claim.clone()),
            Error::<Test>::ProofTooLong
        );
    })
}

// test cases for revoke_claim
#[test]
fn revoke_claim_works() {
    new_test_ext().execute_with(|| {
        // mock.rs MaxClaimLength is 6, we set 7 length here.
        let claim = vec![0, 1,];
        let _ = PoeModule::create_claim(Origin::signed(1), claim.clone());

        assert_ok!(PoeModule::revoke_claim(Origin::signed(1), claim.clone()));

    })
}

#[test]
fn revoke_claim_failed_when_claim_is_not_exists() {
    new_test_ext().execute_with(|| {
        let claim = vec![0, 1];

        assert_noop!(PoeModule::revoke_claim(Origin::signed(1), claim.clone()), Error::<Test>::ClaimNotExist);
    })
}

#[test]
fn revoke_claim_failed_when_wrong_owner() {
    new_test_ext().execute_with(|| {
        let claim = vec![0, 1];
        let _ = PoeModule::create_claim(Origin::signed(1), claim.clone());

        assert_noop!(PoeModule::revoke_claim(Origin::signed(2), claim.clone()), Error::<Test>::NotClaimOwner);
    })
}

#[test]
fn transfer_claim_works(){
    new_test_ext().execute_with(|| {
        let claim = vec![0, 1];
        let _ = PoeModule::create_claim(Origin::signed(1), claim.clone());
        assert_ok!(PoeModule::transfer_claim(Origin::signed(1), claim.clone(), 2));

        assert_eq!(Proofs::<Test>::get(&claim), (2, system::Module::<Test>::block_number()));
    })
}

//when above tests completed, run all tests with command `cargo test`