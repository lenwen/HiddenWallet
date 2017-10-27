﻿using NBitcoin;
using Newtonsoft.Json.Linq;
using Nito.AsyncEx;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace HiddenWallet.WebClients.SmartBit
{
    public class SmartBitClient : IDisposable
	{
		public Network Network { get; }
		private HttpClient HttpClient { get; }
		public Uri BaseAddress => HttpClient.BaseAddress;
		private readonly AsyncLock _asyncLock = new AsyncLock();

		public SmartBitClient(Network network, HttpMessageHandler handler = null, bool disposeHandler = false)
		{
			Network = network ?? throw new ArgumentNullException(nameof(network));
			if (handler != null)
			{
				HttpClient = new HttpClient(handler, disposeHandler);
			}
			HttpClient = new HttpClient();
			if (network == Network.Main)
			{
				HttpClient.BaseAddress = new Uri("https://api.smartbit.com.au/v1/");
			}
			else if (network == Network.TestNet)
			{
				HttpClient.BaseAddress = new Uri("https://testnet-api.smartbit.com.au/v1/");
			}
			else throw new NotSupportedException($"{network} is not supported");
		}

		public async Task PushTransactionAsync(Transaction transaction, CancellationToken cancel)
		{
			using (await _asyncLock.LockAsync())
			{
				var content = new StringContent(
					new JObject(new JProperty("hex", transaction.ToHex())).ToString(),
					Encoding.UTF8,
					"application/json");

				HttpResponseMessage response =
						await HttpClient.PostAsync("blockchain/pushtx", content, cancel);

				if (!response.IsSuccessStatusCode) throw new HttpRequestException(response.StatusCode.ToString());
				string responseString = await response.Content.ReadAsStringAsync();
				AssertSuccess(responseString);
			}
		}

		#region IDisposable Support
		private bool _disposedValue = false; // To detect redundant calls

		protected virtual void Dispose(bool disposing)
		{
			if (!_disposedValue)
			{
				if (disposing)
				{
					// dispose managed state (managed objects).
					HttpClient?.Dispose();
				}

				// free unmanaged resources (unmanaged objects) and override a finalizer below.
				// set large fields to null.

				_disposedValue = true;
			}
		}

		// override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
		// ~BlockCypherClient() {
		//   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
		//   Dispose(false);
		// }

		// This code added to correctly implement the disposable pattern.
		public void Dispose()
		{
			// Do not change this code. Put cleanup code in Dispose(bool disposing) above.
			Dispose(true);
			// uncomment the following line if the finalizer is overridden above.
			// GC.SuppressFinalize(this);
		}
		#endregion
	}
}