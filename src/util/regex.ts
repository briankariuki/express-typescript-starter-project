export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const PHONE_NUMBER_REGEX = /^[+]{1}[\d]{12}$/;

export const PASSWORD_REGEX = /^[^\s]{6,64}$/;

export const NAME_REGEX = /^[^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/;

export const USERNAME_REGEX = /^[\w]{1,64}$/;

export const HASHTAG_REGEX = /(?<=(^|[\s.])#)\w+(?=($|[\s.]))/g;

export const USERNAME_TAG_REGEX = /(?<=(^|[\s.])@)\w+(?=($|[\s.]))/g;
