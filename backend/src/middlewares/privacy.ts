import { Person, Biography } from "@prisma/client";

export function sanitizePersonData<T extends Partial<Person> & { biography?: Partial<Biography> | null }>(person: T, isLoggedIn: boolean): T {
  if (isLoggedIn) return person;
  if (person.isAlive) {
    return {
      ...person,
      fullName: 'Pomparan (Privat)',
      nickname: null,
      birthDateEst: null,
      deathDateEst: null,
      notes: '[Barita dipeakhon - Masuk ma tu akun keluarga asa diida]',
      biography: null,
    };
  }
  return person;
}

export function sanitizePersonsList<T extends any>(persons: T[], isLoggedIn: boolean): T[] {
  return persons.map((p) => sanitizePersonData(p, isLoggedIn));
}