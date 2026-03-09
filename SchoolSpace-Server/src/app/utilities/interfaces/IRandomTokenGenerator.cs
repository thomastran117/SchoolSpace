namespace backend.app.utilities.interfaces
{
    public interface IRandomTokenGenerator
    {
        string Generate(int byteLength);
    }
}
