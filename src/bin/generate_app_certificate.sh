#!/usr/bin/env bash
set -e

PROG="$(basename "$0")"

printUsage() {
    echo "Usage: $PROG ENTITY-ID ENDPOINT-URL PATH"
    echo ""
    echo "Example:"
    echo "  $PROG urn:someservice https://sp.example.org/mellon /tmp/"
    echo ""
}

if [ "$#" -lt 2 ]; then
    printUsage
    exit 1
fi

ENTITYID="$1"
if [ -z "$ENTITYID" ]; then
    echo "$PROG: An entity ID is required." >&2
    exit 1
fi
#echo "DEBUG 1"
BASEURL="$2"
if [ -z "$BASEURL" ]; then
    echo "$PROG: The URL to the MellonEndpointPath is required." >&2
    exit 1
fi
#echo "DEBUG 2"
PATH="$3"

if ! echo "$BASEURL" | /bin/grep -q '^https\?://'; then
    echo "$PROG: The URL must start with \"http://\" or \"https://\"." >&2
    exit 1
fi
#echo "DEBUG 3"
HOST="$(echo "$BASEURL" | /bin/sed 's#^[a-z]*://\([^/]*\).*#\1#')"
BASEURL="$(echo "$BASEURL" | /bin/sed 's#/$##')"
#echo "DEBUG 4"
OUTFILE="$PATH$(echo "$ENTITYID" | /bin/sed 's/[^0-9A-Za-z.-]/_/g' | /bin/sed 's/__*/_/g')"
#echo "DEBUG 5"

echo "Output files:"
echo "Private key:               $OUTFILE.key"
echo "Certificate:               $OUTFILE.cert"
echo "Metadata:                  $OUTFILE.xml"
echo "Host:                      $HOST"
echo
echo "Endpoints:"
echo "SingleLogoutService:       $BASEURL/logout"
echo "AssertionConsumerService:  $BASEURL/postResponse"
echo

# No files should not be readable by the rest of the world.
umask 0077

TEMPLATEFILE="$(/bin/mktemp -t mellon_create_sp.XXXXXXXXXX)"
#echo "DEBUG 6"
/bin/cat >"$TEMPLATEFILE" <<EOF
RANDFILE           = /dev/urandom
[req]
default_bits       = 2048
default_keyfile    = privkey.pem
distinguished_name = req_distinguished_name
prompt             = no
policy             = policy_anything
[req_distinguished_name]
commonName         = $HOST
EOF
#echo "DEBUG 7"
/usr/bin/openssl req -utf8 -batch -config "$TEMPLATEFILE" -new -x509 -days 3652 -nodes -out "$OUTFILE.cert" -keyout "$OUTFILE.key" #2>/dev/null
#echo "DEBUG 8"
/bin/rm -f "$TEMPLATEFILE"
#echo "DEBUG 9"
CERT="$(/bin/grep -v '^-----' "$OUTFILE.cert")"
#echo "DEBUG 10"
/bin/cat >"$OUTFILE.xml" <<EOF
<EntityDescriptor entityID="$ENTITYID" xmlns="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>$CERT</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </KeyDescriptor>
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="$BASEURL/logout"/>
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="$BASEURL/postResponse" index="0"/>
  </SPSSODescriptor>
</EntityDescriptor>
EOF
#echo "DEBUG 11"
umask 0777
/bin/chmod go+r "$OUTFILE.xml"
/bin/chmod go+r "$OUTFILE.cert"
#echo "DEBUG 12"