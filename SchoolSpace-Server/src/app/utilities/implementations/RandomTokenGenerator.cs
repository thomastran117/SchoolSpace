using System.Security.Cryptography;
using backend.app.utilities.interfaces;

namespace backend.app.utilities.implementations
{
    public sealed class RandomTokenGenerator : IRandomTokenGenerator
    {
        public string Generate(int byteLength)
        {
            var bytes = new byte[byteLength];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }
    }
}
