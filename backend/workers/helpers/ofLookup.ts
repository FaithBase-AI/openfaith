import { addressesTable, campusesTable, peopleTable, phoneNumbersTable } from '@openfaith/db'
import {
  pcoAddressTransformer,
  pcoCampusTransformer,
  pcoPersonTransformer,
  pcoPhoneNumberTransformer,
} from '@openfaith/pco/server'
import { BaseAddress, BaseCampus, BasePerson, BasePhoneNumber } from '@openfaith/schema'

export const ofLookup = {
  Address: {
    ofEntity: 'address',
    ofSchema: BaseAddress,
    table: addressesTable,
    transformer: pcoAddressTransformer,
  },
  Campus: {
    ofEntity: 'campus',
    ofSchema: BaseCampus,
    table: campusesTable,
    transformer: pcoCampusTransformer,
  },
  Person: {
    ofEntity: 'person',
    ofSchema: BasePerson,
    table: peopleTable,
    transformer: pcoPersonTransformer,
  },
  PhoneNumber: {
    ofEntity: 'phoneNumber',
    ofSchema: BasePhoneNumber,
    table: phoneNumbersTable,
    transformer: pcoPhoneNumberTransformer,
  },
}
