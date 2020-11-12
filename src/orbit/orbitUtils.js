export async function determineDBAddress({ orbit, name, type, identityId }) {
    const options = identityId ? {accessController: { write: [identityId] } } : {};
    const ipfsMultihash = (await orbit.determineAddress(name, type, options)).root;
    return `/orbitdb/${ipfsMultihash}/${name}`;
}
